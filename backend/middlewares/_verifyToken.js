import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { isTokenBlacklisted } from "./_tokenBlacklist.js";
import { responseHandler } from "../utils/index.js";
import HttpStatus from "http-status-codes";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

/* JWT token verification middleware */
const authenticationVerifier = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        if (!token) {
            console.log("Token not found in auth header");
            return responseHandler(res, HttpStatus.UNAUTHORIZED, 'error', "Token not found.");
        }

        console.log("Token received:", token);

        // Check if the token is blacklisted
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            console.error("Token is blacklisted");
            return responseHandler(res, HttpStatus.UNAUTHORIZED, 'error', "Invalid token. Please log in again to get new token.");
        }

        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                console.error("Token verification failed:", err);
                return responseHandler(res, HttpStatus.UNAUTHORIZED, 'error', "Invalid token. Please log in again to get new token.");
            }
            req.user = user;
            next();
        });
    } else {
        console.log("No auth header found");
        return responseHandler(res, HttpStatus.UNAUTHORIZED, 'error', "You are not authenticated. Please log in to get new token.");
    }
};

/* Access level verification middleware */
const accessLevelVerifier = (req, res, next) => {
    authenticationVerifier(req, res, () => {
        if (req.user.id === req.params.userId || req.user.isAdmin) {
            next();
        } else {
            responseHandler(res, HttpStatus.FORBIDDEN, 'error', "You are not allowed to perform this task.");
        }
    });
};

/* Admin verification middleware */
const isAdminVerifier = (req, res, next) => {
    authenticationVerifier(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            responseHandler(res, HttpStatus.FORBIDDEN, 'error', "You are not allowed to perform this task.");
        }
    });
};

export { authenticationVerifier, accessLevelVerifier, isAdminVerifier };
