import HttpStatus from 'http-status-codes';
import User from "../models/_user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { responseHandler, emailQueue, generatePasswordResetEmail } from "../utils/index.js";

dotenv.config();

const AuthController = {
    create_user: async (req, res, next) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            });
            const user = await newUser.save();
            responseHandler(res, HttpStatus.CREATED, "success", "User has been created successfully", { user });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    },

    login_user: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
                return responseHandler(res, HttpStatus.UNAUTHORIZED, "error", "Invalid username or password");
            }

            const accessToken = jwt.sign(
                { id: user._id, isAdmin: user.isAdmin },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            const { password, ...data } = user._doc;
            responseHandler(res, HttpStatus.OK, "success", "Successfully logged in", { ...data, accessToken });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    },

    logout_user: async (req, res) => {
        responseHandler(res, HttpStatus.OK, "success", "Successfully logged out");
    },

    forgot_password: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            const message = generatePasswordResetEmail(req.headers.host, token);

            // Adding email job to the queue
            await emailQueue.add({
                to: user.email,
                subject: message.subject,
                text: message.message
            });

            responseHandler(res, HttpStatus.OK, "success", "Password reset email sent successfully");
        } catch (err) {
            if (user) {
                user.resetPasswordToken = null;
                user.resetPasswordExpires = null;
                await user.save();
            }

            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to send email, please try again", { error: err.message });
        }
    },

    reset_password: async (req, res) => {
        try {
            const user = await User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Password reset token is invalid or has expired");
            }

            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            responseHandler(res, HttpStatus.OK, "success", "Password has been reset successfully");
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    }
};

export default AuthController;
