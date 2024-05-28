// REGISTER CONTROLLER
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createUser } from './user.controller.js';
import { validationResult } from 'express-validator';
import { handleResponse } from '../utility/handle.response.js';
import { updateBlacklist } from '../middleware/tokenBlacklist.js';
dotenv.config();

const { sign } = jwt;
const { compare } = bcrypt;

// Secret key for jwt signing and verification
const secretKey = process.env.SECRETKEY;

/**
 * Generate token for user. Expiration 5hrs
 * @param {User} user - User object to generate token for
 */
function createToken(user) {
  return sign({ id: user._id, email: user.email }, secretKey, { expiresIn: '5h' });
}

/**
 * Register user
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @return Payload on Success
 */
export async function signup(req, res) {
  // Validate the data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return handleResponse(res, 400, errors.array()[0].msg);
  }

  const { email, password, username, age, period } = req.body;

  return await createUser({ email, password, username, age, period }, res);
}

/**
 * Login user
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @return Payload on Success
 */
export async function login(req, res) {
  // Validate the data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return handleResponse(res, 400, errors.array()[0].msg);
  };

  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return handleResponse(res, 404, "email doesn't exist");
  }

  const matched = await compare(password, user.password);
  try {
    if (matched) {
        const token = createToken(user);
        res.status(200).json({
          message: 'Authentication successful',
          token});
    } else {
      return handleResponse(res, 401, 'Incorrect Password');
    }
  } catch (error) {
    return handleResponse(res, 500, 'Internal Server Error', error);
  }
}

/**
 * Logout user
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @return Payload on Success
 */
export async function logout(req, res) {
  try {
    let token = req.header('Authorization');

    // if token is present then update to the blacklist
    if (token) {
      token = token.substring(7); // remove Bearer
      updateBlacklist(token);
    }

    return res.status(200).send();
  } catch (error) {
    return handleResponse(res, 500, 'Internal Server Error', error);
  }
}
