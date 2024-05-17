import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import DBClient from "../storage/db.js";
import RedisClient from "../storage/redis.js";
import OTPService from "../util/otp.js";

/**
 * Controller handling authentication-related endpoints.
 */
class AuthController {
  /**
   * Creates an instance of AuthController.
   */
  constructor() {
    this.otpService = new OTPService();
    this.dbClient = new DBClient();
    this.redisClient = new RedisClient();
  }

  /**
   * Authenticates a user and generates an authentication token.
   *
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async getConnect(request, response) {
    try {
      const { email, password } = request.body;
      const user = await this.dbClient.fetchUserByEmail(email);

      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          const token = uuidv4();
          const key = `auth_${token}`;

          await this.redisClient.set(key, user._id.toString(), 86400);

          response
            .status(200)
            .json({
              status: "success",
              message: "Sign in successful",
              data: { token },
            })
            .end();
        } else {
          response
            .status(401)
            .json({
              status: "error",
              message: "Incorrect password",
              data: null,
            })
            .end();
        }
      } else {
        response
          .status(401)
          .json({
            status: "error",
            message: "User does not exist",
            data: null,
          })
          .end();
      }
    } catch (error) {
      console.error(error);
      response
        .status(500)
        .json({ status: "error", message: "Internal Server Error", data: null })
        .end();
    }
  }

  /**
   * Logs out a user by invalidating their authentication token.
   *
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async getDisconnect(request, response) {
    const token = request.headers["auth-token"];
    const key = `auth_${token}`;
    const userID = await this.redisClient.get(key);

    if (!userID) {
      response
        .status(401)
        .json({
          status: "error",
          message: "Invalid token",
          data: null,
        })
        .end();
    } else {
      const user = await this.dbClient.fetchUserById(userID);

      if (!user) {
        response
          .status(404)
          .json({
            status: "error",
            message: "Invalid token",
            data: null,
          })
          .end();
      } else {
        await this.redisClient.del(key);
        response.status(200).json({ status: "Success", message: "Logout successful", data: null }).end();
      }
    }
  }

  /**
   * Retrieves information about the currently authenticated user.
   *
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async getMe(request, response) {
    const token = request.headers["auth-token"];
    const key = `auth_${token}`;

    try {
      const userID = await this.redisClient.get(key);

      if (!userID) {
        response
          .status(401)
          .json({
            status: "error",
            message: "Invalid token",
            data: null,
          })
          .end();
      } else {
        const user = await this.dbClient.fetchUserById(userID);

        if (!user) {
          response
            .status(404)
            .json({
              status: "error",
              message: "User not found",
              data: null,
            })
            .end();
        } else {
          response
            .status(200)
            .json({
              status: "success",
              message: "Current user fetched successfully",
              data: {
                id: user._id,
                email: user.email,
                username: user.username,
              },
            })
            .end();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Initiates the password reset process for a user.
   *
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async forgotPassword(request, response) {
    try {
      const { email } = request.body;
      const user = await this.dbClient.fetchUserByEmail(email);

      if (user) {
        const otp = this.otpService.generateOTP();
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

        await this.otpService.sendOTPByEmail(email, otp);

        user.passwordResetOTP = { code: otp, expirationTime };
        await user.save();

        response
          .status(200)
          .json({
            status: "success",
            message: "OTP sent to your email for password reset.",
            data: null,
          })
          .end();
      } else {
        response
          .status(401)
          .json({
            status: "error",
            message: "User does not exist",
            data: null,
          })
          .end();
      }
    } catch (error) {
      console.error(error);
      response
        .status(500)
        .json({ status: "error", message: "Internal Server Error", data: null })
        .end();
    }
  }

  /**
   * Resets the password for a user using a valid OTP.
   *
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async resetPassword(request, response) {
    try {
      const { email, otp, newPassword } = request.body;
      const user = await this.dbClient.fetchUserByEmail(email);

      if (!user) {
        response.status(401).json({ status: "error", message: "User does not exist", data: null }).end();
        return;
      }

      if (!user.passwordResetOTP || user.passwordResetOTP.code !== otp) {
        response.status(401).json({ status: "error", message: "Invalid OTP", data: null }).end();
        return;
      }

      if (this.otpService.isOTPExpired(user.passwordResetOTP.expirationTime)) {
        response.status(401).json({ status: "error", message: "OTP has expired", data: null }).end();
        return;
      }

      // Check if newPassword is null or undefined
      if (!newPassword) {
        response.status(400).json({ status: "error", message: "New password is required", data: null }).end();
        return;
      }

      // Update user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      user.passwordResetOTP = null;
      await user.save();

      response.status(200).json({ status: "success", message: "Password reset successfully.", data: null }).end();
    } catch (error) {
      console.error(error);
      response.status(500).json({ status: "error", message: "Internal Server Error", data: null }).end();
    }
  }
}

export default AuthController;
