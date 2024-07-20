import jwt from 'jsonwebtoken';
import { responseHandler } from "../utils/index.js";
import HttpStatus from "http-status-codes";
import { isTokenBlacklisted } from './_tokenBlacklist.js';

const { verify } = jwt;

/**
 * Verify user's token
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns 
 */
const tokenVerification = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token) {
      return responseHandler(res, HttpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    const secretKey = process.env.JWT_SECRET;
    token = token.substring(7); // remove Bearer

    // Check if the token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return responseHandler(res, HttpStatus.UNAUTHORIZED, 'Invalid token');
    }

    verify(token, secretKey, (err, user) => {
      if (err) {
        return responseHandler(res, HttpStatus.UNAUTHORIZED, 'Invalid token');
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
};

export default tokenVerification;
