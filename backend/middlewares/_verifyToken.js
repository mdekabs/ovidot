import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { isTokenBlacklisted } from "./_tokenBlacklist.js";

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
            return res.status(401).json("Token not found");
        }

        console.log("Token received:", token);

        // Check if the token is blacklisted
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            console.error("Token is blacklisted");
            return res.status(401).json("Invalid token");
        }

        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                console.error("Token verification failed:", err);
                return res.status(401).json("Invalid token");
            }
            req.user = user;
            next();
        });
    } else {
        console.log("No auth header found");
        return res.status(401).json("You are not authenticated");
    }
};

/* Access level verification middleware */
const accessLevelVerifier = (req, res, next) => {
    authenticationVerifier(req, res, () => {
        if (req.user.id === req.params.userId || req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to perform this task");
        }
    });
};

/* Admin verification middleware */
const isAdminVerifier = (req, res, next) => {
    authenticationVerifier(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to perform this task");
        }
    });
};

export { authenticationVerifier, accessLevelVerifier, isAdminVerifier };
