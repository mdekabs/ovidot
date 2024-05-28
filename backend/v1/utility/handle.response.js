import { logger } from "../middleware/logger.js";

/**
 * Handle response sent to user.
 * @param {Object} res - response object
 * @param {HTTP} code - Http Status code
 * @param {String} mes - The message to send
 * @param {Object} error - error object
 * @returns 
 */
export function handleResponse(res, code, mes, error=null) {
    if (code == 500) logger.error(error);
    return res.status(code).json({ message: mes });
}
