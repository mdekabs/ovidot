import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

/* JWT token verification middleware */
const authenticationVerifier = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
        const token = authHeader && authHeader.split(' ')[1];
        console.log("Token received:", token);
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
