// User Token Verification
import jwt from 'jsonwebtoken';
import { handleResponse } from '../utility/handle.response.js';
import { isTokenBlacklisted } from './tokenBlacklist.js';

const { verify } = jwt;

/**
 * Verify user's token
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns 
 */
const tokenVerification = (req, res, next) => {
  let token = req.header('Authorization');

  if (!token) {
    return handleResponse(res, 401, 'Unauthorized');
  }

  const secretKey = process.env.SECRETKEY;
  token = token.substring(7); // remove Bearer

  // Check if the token is blacklisted
  if (isTokenBlacklisted(token)) {
    return handleResponse(res, 401, 'Invalid token');
  }

  verify(token, secretKey, (err, user) => {
    if (err) {
      return handleResponse(res, 401, 'Invalid token');
    }

    req.user = user;
    next();
  });
};

export default tokenVerification;
