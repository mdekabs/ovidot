// USER CONTROLLER (CRUD)
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { handleResponse } from '../utility/handle.response.js';
import notifications from '../services/notifications.js';
import { validationResult } from 'express-validator';

const { genSalt, hash } = bcrypt;

/**
 * Create the user object for the new user if it doesn't exist
 * @data - user data passed, used for creating a user.
 * @res - Express Response
 * @returns Payload on success
 */
export async function createUser(data, res) {
	// create a user
	const email = data.email
	const existUser = await User.findOne({ email });
	if (existUser) {
		return handleResponse(res, 404, `${email} already exist.`);
	}

	try {
		const saltRounds = 12;
		const salt = await genSalt(saltRounds);
		// Hash the password
		const hashedPassword = await hash(data.password, salt);
				data.password = hashedPassword;
		// Register the new user data. The create method prevents sql injection
		const newUser = await User.create(data);

		// create notification
		const message = `${newUser.username}, your account has been created`;
		const notify = notifications.generateNotification(newUser, 'createdUser', message);

		// Add new notification
		newUser.notificationsList.push(notify);

		await newUser.save();

		// send email notification
		await notifications.sendUserCreationNotification(newUser);
		return res.status(201).send();

	} catch (error) {
		return handleResponse(res, 500, 'Internal Server Error', error);
	}
};

/**
 * Find the user and update the data passed.
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns - updated user object
 */
export async function updateUser(req, res) {
	// get userId from params
	try {
		// validate the params
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return handleResponse(res, 400, errors.array()[0].msg);
		}

		const userId = req.user.id;
		const { username, age, period } = req.body;

		if (age <= 0 || period <= 0) {
			return handleResponse(res, 400, "Invalid value");
		}

		if (!username && !age && !period) {
			return handleResponse(res, 400, "Provide atleast a param to update: username, period or age");
		};

		const updatedAt = new Date();
		const user = await User.findByIdAndUpdate(userId,
      {username: username, age: age, period: period, updated_at: updatedAt},
			{new: true});

		/* check for conditons */
		if(!user) {
			return handleResponse(res, 404, "User not found");
		};

		// create notification
		const message = 'Your profile has been updated'

		const notify = notifications.generateNotification(user, 'updatedUser', message);

		// Add new notification
		user.notificationsList.push(notify);

		// manage noifications
		notifications.manageNotification(user.notificationsList);

		await user.save();

		// else return OK response
		res.status(200).json({
			userId: user._id,
			email: user.email,
			username: user.username,
			age: user.age,
			period: user.period
		});
	} catch(error) {
		return handleResponse(res, 500, "Internal server error", error);
	}
}

/**
 * Fetch and return the user data from the database.
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @returns -  the user data.
 */
export async function fetchUser(req, res) {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);

		/* check for conditons */
		if(!user) {
			return handleResponse(res, 404, "User not found");
		}

		return res.status(200).json({
			userId: user._id,
			email: user.email,
			username: user.username,
			age: user.age,
			period: user.period
		});

	} catch(error) {
		return handleResponse(res, 500, "Internal server error", error);
	}
}

/**
 * Delete the user data from the database.
 * @param {Object} res - response sent to user
 * @param {Object} req - request from user
 * @returns - Payload on Success
 */
export async function deleteUser(req, res) {
	try {
		const userId = req.user.id;
		const user = await User.findByIdAndDelete(userId);
		if (!user) {
			return handleResponse(res, 404, "User not found");
		}

		// send email notification
		await notifications.sendUserTerminationNotification(user);

		return res.status(204).send();
	} catch (error) {
		handleResponse(res, 500, "Internal server error", error);
	}
};
