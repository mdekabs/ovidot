import jwt from "jsonwebtoken";

const JWT_EXPIRATION = "1d";

export const createToken = (user) => jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
);
