// controllers/AuthController.js
import HttpStatus from "http-status-codes";
import User from "../models/_user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import {
  responseHandler,
  emailQueue,
  generatePasswordResetEmail,
  generateWelcomeEmail,
  createToken
} from "../utils/index.js";
import { updateBlacklist } from "../middlewares/_tokenBlacklist.js";

dotenv.config();

const PASSWORD_SALT_ROUNDS = 10;
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TOKEN_EXPIRATION = 3600000;

const AuthController = {
  create_user: async (req, res) => {
    const { username, email, password } = req.body;
    try {
      if (await User.exists({ $or: [{ username }, { email }] })) {
        return responseHandler(res, HttpStatus.CONFLICT, "error", "Username or email already exists. Login or create a new account.");
      }

      const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
      const newUser = await User.create({ username, email, password: hashedPassword });

      responseHandler(res, HttpStatus.CREATED, "success", "User has been created successfully", { user: newUser });

      const welcomeMessage = generateWelcomeEmail(username);
      emailQueue.add({
        to: email,
        subject: welcomeMessage.subject,
        text: welcomeMessage.message
      });

    } catch (err) {
      responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
    }
  },

  login_user: async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      const isValidPassword = user && await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return responseHandler(res, HttpStatus.UNAUTHORIZED, "error", "Invalid username or password");
      }

      const accessToken = createToken(user);
      const { password: _, ...userData } = user._doc;
      responseHandler(res, HttpStatus.OK, "success", "Successfully logged in", { ...userData, accessToken });
    } catch (err) {
      responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
    }
  },

  logout_user: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return responseHandler(res, HttpStatus.UNAUTHORIZED, "error", "No token provided");
    }

    try {
      await updateBlacklist(token);
      responseHandler(res, HttpStatus.OK, "success", "Successfully logged out");
    } catch (err) {
      responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
    }
  },

  forgot_password: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
      }

      const token = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION;
      await user.save();

      const message = generatePasswordResetEmail(req.headers.host, token);
      emailQueue.add({
        to: email,
        subject: message.subject,
        text: message.message
      });

      responseHandler(res, HttpStatus.OK, "success", "Password reset email sent successfully");
    } catch (err) {
      responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to send email, please try again", { error: err.message });
    }
  },

  reset_password: async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Password reset token is invalid or has expired");
      }

      user.password = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
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
