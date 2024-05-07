import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

/**
 * Service for handling OTP (One-Time Password) related operations.
 */
class OTPService {
  /**
   * Creates an instance of OTPService.
   */
  constructor() {
    const emailService = process.env.APP_SERVICE;
    const emailAddress = process.env.APP_EMAIL;
    const emailPassword = process.env.APP_PASSWORD;

    /**
     * Nodemailer transporter for sending emails.
     * @type {nodemailer.Transporter}
     */
    this.transporter = nodemailer.createTransport({
      host: "smtp.ionos.com",
      port: 587,
      secure: false,
      service: emailService,
      auth: {
        user: emailAddress,
        pass: emailPassword,
      },
    });
  }

  /**
   * Sends OTP (One-Time Password) to the specified email address.
   * @param {string} email - The email address to send OTP to.
   * @param {string} otp - The generated OTP.
   * @returns {Promise<void>} - A promise that resolves when the OTP email is sent.
   */
  async sendOTPByEmail(email, otp) {
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: "OTP for gaining access",
      text: `We can't wait to have you onboard!! Your OTP for login is: ${otp}`,
    };
    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generates a random OTP (One-Time Password) of specified length.
   * @param {number} [length=6] - The length of the OTP.
   * @returns {string} - The generated OTP.
   */
  generateOTP(length = 6) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      const index = crypto.randomInt(0, digits.length);
      otp += digits[index];
    }
    return otp;
  }

  /**
   * Checks if the OTP has expired based on the provided expiration timestamp.
   * @param {number} expirationTimestamp - The expiration timestamp of the OTP.
   * @returns {boolean} - True if the OTP has expired, otherwise false.
   */
  isOTPExpired(expirationTimestamp) {
    const currentTimestamp = Date.now();
    return currentTimestamp > expirationTimestamp;
  }
}

export default OTPService;
