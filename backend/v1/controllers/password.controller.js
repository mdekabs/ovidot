// PASSWORD CONTROLLER
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { v4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { handleResponse } from '../utility/handle.response.js';
import { isTokenBlacklisted, updateBlacklist } from '../middleware/tokenBlacklist.js';
import { validationResult } from 'express-validator';
import { sender } from '../services/notifications.js';
import notifications from '../services/notifications.js';
import { renderForgetTemplate } from '../services/views/handle.template.js';
import { logger } from '../middleware/logger.js';
dotenv.config();

const { genSalt, hash, compare } = bcrypt;

/**
 * Default URL host for generating reset links.
 * @constant {string}
 */
const HOST = process.env.HOST || 'localhost';

/**
 * Default port for generating reset links.
 * @constant {string}
 */
const PORT = process.env.PORT || '3000';

/**
 * Default reset token expiration time (30 minutes).
 * @constant {number}
 */
const RESET_TOKEN_EXPIRATION = 30 * 60 * 1000;

/**
 * Default number of allowed notifications (15).
 * @constant {number}
 */
const MAX_NOTIFICATIONS = 15;

/**
 * Generate a reset token using uuid.v4.
 * @returns {string} A unique uuid.
 */
function resetToken() {
  return v4();
}

/**
 * Send reset link password to users.
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @return {void}
 */
export async function forgotPass(req, res) {
  try {
    // validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, errors.array()[0].msg);
    }

    const { email, url } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return handleResponse(res, 404, `${email} not registered`);
    }

    const token = resetToken();
    const resetExp = new Date(Date.now() + RESET_TOKEN_EXPIRATION);
    user.reset = token;
    user.resetExp = resetExp;
    await user.save();

    const resetLink = `${url}/${token}`;

    const forgetPass = await renderForgetTemplate(req, user, resetLink);

    const receiver = {
      to: email,
      subject: 'Password Reset',
      html: forgetPass
    };

    sender.sendMail(receiver, (error, info) => {
      if (error) {
        logger.error('Failed to send email');
        return handleResponse(res, 500, 'Failed to send email', error);
      }
      return handleResponse(res, 201, 'Password reset link sent to email');
    });
  } catch (error) {
    return handleResponse(res, 500, 'Internal Server Error', error);
  }
}

/**
 * Validate reset token.
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @return {void}
 */
export async function VerifyResetPass(req, res) {
  try {
    const { token } = req.params;

    if (!token) return handleResponse(res, 401, 'Requires a token');

    if (isTokenBlacklisted(token)) {
      return handleResponse(res, 401, 'Invalid or expired token');
    }

    const user = await User.findOne({
      reset: token,
      resetExp: { $gt: Date.now() },
    });

    if (!user) {
      return handleResponse(res, 401, 'Invalid or expired token');
    }

    return res.status(200).json({
      message: "success",
      token
    });
  } catch (error) {
    return handleResponse(res, 500, 'Internal server error', error);
  }
}

/**
 * Reset user's password.
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @return {void}
 */
export async function ResetPass(req, res) {
  try {
    // validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, errors.array()[0].msg);
    }

    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return handleResponse(res, 401, 'Invalid password or token');
    }

    if (isTokenBlacklisted(token)) {
      return handleResponse(res, 401, 'Invalid or expired token');
    }

    const user = await User.findOne({
      reset: token,
      resetExp: { $gt: Date.now() },
    });

    if (!user) {
      return handleResponse(res, 401, 'Invalid or expired token');
    }

    const saltRounds = 12;
    const salt = await genSalt(saltRounds);
    // Hash the password
    const hashedNewPassword = await hash(password, salt);
    user.password = hashedNewPassword;
    await user.save();

    updateBlacklist(token);

    return handleResponse(res, 200, "Password changed");
  } catch (error) {
    return handleResponse(res, 500, 'Internal Server Error', error);
  }
}

/**
 * Change logged-in user password.
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @return {void}
 */
export async function changePass(req, res) {
  try {
    // validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, errors.array()[0].msg);
    }

    const { currentPassword, newPassword } = req.body;

    if (currentPassword === newPassword) {
      return handleResponse(res, 400, "Please provide a new password");
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return handleResponse(res, 400, 'Current password is incorrect');
    }

    const saltRounds = 12;
    const salt = await genSalt(saltRounds);
    const hashedNewPassword = await hash(newPassword, salt);

    user.password = hashedNewPassword;

    // create notification
    const notify = notifications.generateNotification(user, 'updatedUser', 'Password changed');

    // Add new notification
    user.notificationsList.push(notify);

    // manage notifications
    notifications.manageNotification(user.notificationsList);

    await user.save();

    return res.status(204).send('Password changed');
  } catch (error) {
    return handleResponse(res, 500, 'Internal Server Error', error);
  }
}
