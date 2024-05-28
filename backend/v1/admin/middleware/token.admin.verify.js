import { handleResponse } from '../../utility/handle.response.js';
import { isTokenBlacklisted } from '../../middleware/tokenBlacklist.js';
import jwt from 'jsonwebtoken';

const { verify } = jwt;

/**
 * Verify admin token
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const adminTokenVerification = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return handleResponse(res, 401, 'Unauthorized');
  }

  // import secret key
  const secretKey = process.env.ADMINKEY;

  // Remove 'Bearer' from the token
  const tokenWithoutBearer = token.substring(7);

  // Check if the token is blacklisted
  if (isTokenBlacklisted(tokenWithoutBearer)) {
    return handleResponse(res, 401, 'Invalid token');
  }

  // verify the token
  verify(tokenWithoutBearer, secretKey, (err, user) => {
    if (err) {
      return handleResponse(res, 401, 'Invalid token');
    }

    req.user = user;
    next();
  });
};

export default adminTokenVerification;
