
import notifications from '../services/notifications.js';
import Cycle from '../models/cycle.model.js';
import User from '../models/user.model.js';
import { month as _month, calculate } from '../utility/cycle.calculator.js';
import { cycleParser } from './cycle.parsers.js';

const MIN_UPDATE_DIFFERENCE = 7;

const DATE_FORMAT = 'YYYY-MM-DD';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

/**
 * Check if there is an existing cycle for the given user and start date.
 *
 * @param {Object} user - The user object containing information about the user.
 * @param {Date} startdate - The start date of the cycle to be checked.
 * @returns {boolean} - True if an existing cycle needs an update or deletion, false otherwise.
 */
export const checkExistingCycle = (user, startdate) => {
  const hasCycles = user._cycles.length > 0;

  if (hasCycles) {
    const lastCycle = user._cycles[user._cycles.length - 1];
    const nextDate = new Date(lastCycle.next_date);
    const startDate = new Date(startdate);
    const differenceInDays = (nextDate - startDate) / MILLISECONDS_IN_A_DAY;

    return differenceInDays > MIN_UPDATE_DIFFERENCE;
  }

  return false;
};

/**
 * Create a new cycle and notify the user.
 *
 * @param {object} newCycle - The new cycle object to be saved.
 * @param {object} user - The user object.
 * @param {string} startdate - The start date of the cycle.
 * @throws {Error} If an error occurred during the process.
 */
export const createCycleAndNotifyUser = async (newCycle, user, startdate) => {
  try {
    // Save the new cycle
    await newCycle.save();

    const message = `Cycle created for ${startdate}`;

    // Generate notification and add it to the user's list
    const notify = notifications.generateNotification(newCycle, 'createdCycle', message);
    user.notificationsList.push(notify);

    // Manage notifications
    notifications.manageNotification(user.notificationsList);

    // Update the user's cycles and notifications list
    user._cycles.push(newCycle._id);
    await User.findByIdAndUpdate(user.id, {
      _cycles: user._cycles,
      notificationsList: user.notificationsList,
    });
  } catch (error) {
    // If an error occurred, delete the new cycle
    if (newCycle) {
      await Cycle.findByIdAndDelete(newCycle._id);
    }
    throw error;
  }
};

/**
 * Updates a cycle and generates a notification for the user.
 *
 * @param {object} cycle - The cycle object to be updated.
 * @param {number} period - The length of the menstrual period.
 * @param {number} ovulation - The day of ovulation.
 * @param {string} cycleId - The ID of the cycle to update.
 * @param {object} user - The user object.
 * @return {object} - The updated cycle object.
 * @throws {Error} If an error occurred during the process.
 */
export const performUpdateAndNotify = async (cycle, period, ovulation, cycleId, user) => {
  try {
    const updated_at = new Date();
    const month = _month(cycle.start_date);
    const updatedData = await calculate(period, cycle.start_date, ovulation);
    const data = cycleParser(month, period, cycle.start_date.toISOString(), updatedData);

    // Update the cycle
    const updatedCycle = await Cycle.findByIdAndUpdate(cycleId, {
      ...data,
      updated_at,
    }, { new: true });

    // Generate notification and add it to the user's list
    const message = `Cycle for ${formatDate(cycle.start_date)} was updated`;
    const notify = notifications.generateNotification(updatedCycle, 'updatedCycle', message);
    user.notificationsList.push(notify);

    // Manage notifications
    notifications.manageNotification(user.notificationsList);

    // Save the user with the updated notifications list
    await user.save();

    return updatedCycle;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a cycle and generates a notification for the user.
 *
 * @param {string} cycleId - The ID of the cycle to be deleted.
 * @param {object} user - The user object.
 * @return {Promise} - A promise that resolves when the cycle is deleted and the notification is generated.
 * @throws {Error} If an error occurred during the process.
 */
export const performDeleteAndNotify = async (cycleId, user) => {
  try {
    const cycle = await Cycle.findByIdAndRemove(cycleId);
    cycle.updated_at = new Date();

    // Generate notification and add it to the user's list
    const message = `Cycle deleted for ${formatDate(cycle.start_date)}`;
    const notify = notifications.generateNotification(cycle, 'deletedCycle', message);
    user.notificationsList.push(notify);

    // Manage notifications
    notifications.manageNotification(user.notificationsList);

    // Save the user with the updated notifications list
    await user.save();

    return cycle;
  } catch (error) {
    throw error;
  }
};

/**
 * Format a date as a string using the specified format.
 *
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
const formatDate = (date) => date.toISOString().split('T')[0];
