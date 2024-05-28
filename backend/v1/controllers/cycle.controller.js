// CYCLE CONTROLLER (CRUD)
import Cycle from '../models/cycle.model.js';
import { month as _month, calculate } from '../utility/cycle.calculator.js';
import User from '../models/user.model.js';
import { validationResult } from 'express-validator';
import { populateWithCycles, populateWithCyclesBy } from '../utility/user.populate.js';
import { validateCreateDate, validateUpdateDate } from '../utility/date.validate.js';
import redisManager from '../services/caching.js';
import { cycleFilter, cycleParser, MONTHS } from '../utility/cycle.parsers.js';
import { checkExistingCycle, createCycleAndNotifyUser,
	performUpdateAndNotify, performDeleteAndNotify } from '../utility/cycle.helpers.js';
import { handleResponse } from '../utility/handle.response.js';
import { logger } from '../middleware/logger.js';


/**
 * Creates a cycle for the user with provided params.
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns Payload on Success
 */
export async function createCycle(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleResponse(res, 400, errors.array()[0].msg);
    }

    const id = req.user.id;
    const { period, ovulation, startdate } = req.body;

    if (!validateCreateDate(startdate)) {
        return handleResponse(res, 400, 'Specify a proper date: Date should not be less than 21 days or greater than present day');
    }

    // Get the month for the date
    const month = _month(startdate);

    const user = await populateWithCycles(id);
    if (user === null) {
        return handleResponse(res, 404, 'User not found');
    }

    if (checkExistingCycle(user, startdate)) {
        return handleResponse(res, 400, "Cycle already exist for this month: Delete to create another");
    };

    // if user._cycles is false (no data), create a new one.
    const cycleData = await calculate(period, startdate, ovulation);

    const data = cycleParser(month, period, startdate, cycleData);
    const newCycle = await Cycle.create({...data});

    // Create the cycle and notification for the user
    await createCycleAndNotifyUser(newCycle, user, startdate);

    // Handle cache
    await Promise.resolve(redisManager.cacheDel(id, newCycle.year.toString()));

    return res.status(201).json({
        message: 'Cycle created',
        cycleId: newCycle.id
    });

  } catch (error) {
    handleResponse(res, 500, "internal server error", error);
  }
}

/**
 * fetch all the cycles for a given user
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns Payload on Success
 */ 
export async function fetchAllCycles(req, res) {
  try {
    const id = req.user.id;
    const year = req.query.year;

    // If a 'year' is provided, use it in the search criteria
    const search = year ? { year: year } : {};

		// If there's a cache data for the year given then return the data
		if (year) {
			const data = await redisManager.cacheGet(id, year.toString());
			if (data) {
				logger.info(`${year} cache retrieved`)
				return res.status(200).json(JSON.parse(data));
			}
		}

    const user = await populateWithCyclesBy(id, search);
    if (!user) {
      return handleResponse(res, 404, 'User not found');
    };

    const cycles = user._cycles.map(cycleFilter);

		// Cache data if year is provided
		if (year) {
			redisManager.cacheSet(id, year.toString(), JSON.stringify(cycles));
		};

    return res.status(200).json(cycles);
  } catch (err) {
    return handleResponse(res, 500, 'Internal Server Error', err);
  }
}

/**
 * get cycle by cycleId for a given user
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns Payload on Success
 */ 
export async function fetchOneCycle(req, res) {
	try {
		const { cycleId } = req.params;
		const userId = req.user.id;

		const user = await populateWithCyclesBy(userId, {_id: cycleId});
		if (user === null) {
			return handleResponse(res, 404, 'User not found');
		}
		if (user._cycles.length == 0) {
			return handleResponse(res, 404, "Cycle not found");
		}

		const cycle = cycleFilter(user._cycles[0]);
		return res.status(200).json(cycle);
	} catch (err) {
		return handleResponse(res, 500, 'Internal Server Error', err);
	}
}

/**
 * Get cycle by month for a given user
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns Payload on Success
 */
export async function fetchMonth(req, res) {
	try {
		let { month } = req.params;
		const year = req.query.year;
		const userId = req.user.id;

		// validate year
		if (year && (typeof +year !== 'number' || isNaN(year) ||+year < 1900 || +year > 2100)) {
		  return handleResponse(res, 400, 'Invalid year');
		};

		// validate month
		if (isNaN(month) && typeof month !== 'string') {
			return handleResponse(res, 400, 'Invalid month');
		}

		// If month data is sent as a Number
		if (typeof +month === 'number' && month >= 1 && month <= 12) {
			month = MONTHS[month];
		} else {
			month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
		}

		const search = year ? { month, year } : { month };
		
		const user = await populateWithCyclesBy(userId, search);
		if (user === null) {
			return handleResponse(res, 404, 'User not found');
		}
		return res.status(200).json(user._cycles);
	} catch (err) {
		return handleResponse(res, 500, 'Internal Server Error', err);
	}
}

/**
 * update a cycle record by cycleId for a given user
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns Payload on Success
 */
export async function updateCycle(req, res) {
	try {
		// Validate the data
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return handleResponse(res, 400, errors.array()[0].msg);
		}

		const { cycleId } = req.params;
		const userId = req.user.id;
		let { period, ovulation } = req.body;

		// validate period data less than 1
		if (period <= 0) {
			return handleResponse(res, 400, "Invalid value");
		}

		const user = await User.findById(userId);
		if (!user) {
			return handleResponse(res, 404, "User not found");
		}

		const cycle = await Cycle.findById(cycleId);
		if (!cycle) {
			return handleResponse(res, 404, "Cycle not found");
		}

		// Check if the user provided at least a data to update
		if ((!period && !ovulation) || (period === cycle.period && ovulation === cycle.ovulation)) {
			return handleResponse(res, 400, "Provide atleast a param to update: period or ovulation");
		}

		// if startdate is 30 days below current date, then update isn't possible
		if (new Date() > new Date(cycle.start_date).setDate(new Date(cycle.start_date).getDate() + 30)) {
			return handleResponse(res, 400, "Update can't be made after 30 days from start date");
		};

		// Validate the ovulation date.
		if (ovulation && !validateUpdateDate(cycle.start_date, ovulation, cycle.period)) {
			return handleResponse(res, 400, 'Ovulation date must not exceed 18 days from start date');
		}

		// If period is not provided, then use the current period
		if (!period) {
			period = cycle.period;
		}

		// Update and notify user
		const updatedCycle = await performUpdateAndNotify(cycle, period, ovulation, cycleId, user);

		const updated = cycleFilter(updatedCycle);

		// Handle cache
		await Promise.resolve(redisManager.cacheDel(userId, updated.year.toString()));		

		return res.status(200).json({
			updated
		});
	}
	catch (error) {
		if (error.statusCode == 400) {
			handleResponse(res, 400, error.message);
		} else {
			handleResponse(res, 500, "internal server error", error);
		}
	}
}

/**
 * Delete cycle by cycleId for a given use
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns Payload on Success
 */
export async function deleteCycle(req, res) {
	try {
		const { cycleId } = req.params;
		const userId = req.user.id;

		const user = await populateWithCyclesBy(userId, {_id: cycleId});
		if (user === null) {
			return handleResponse(res, 404, "User not found");
		}
		if (user._cycles.length == 0) {
			return handleResponse(res, 404, "Cycle not found");
		}

		// Delete and notify user
		const deletdCycle = await performDeleteAndNotify(cycleId, user)

		// Handle cache
		await Promise.resolve(redisManager.cacheDel(userId, deletdCycle.year.toString()));

		return res.status(204).send('Cycle deleted');
	} catch (error) {
		handleResponse(res, 500, "internal server error", error);
	}
};
