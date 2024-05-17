import express from "express";
import UserController from "../controller/userController.js";
import AuthController from "../controller/authController.js";
import CycleController from "../controller/cycleController.js";

const router = express.Router();
const authController = new AuthController();
const userController = new UserController();
const cycleController = new CycleController();

/**
 * @swagger
 * /sign_in:
 *   post:
 *     summary: Sign in user
 *     description: Endpoint to sign in a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User signed in successfully
 *       400:
 *         description: Invalid request body
 */
router.post("/sign_in", (req, res) => authController.getConnect(req, res));

/**
 * @swagger
 * /sign_out:
 *   post:
 *     summary: Sign out user
 *     description: Endpoint to sign out a user.
 *     responses:
 *       200:
 *         description: User signed out successfully
 */
router.post("/sign_out", (req, res) => authController.getDisconnect(req, res));

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user
 *     description: Endpoint to get information about the currently authenticated user.
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/me", (req, res) => authController.getMe(req, res));

/**
 * @swagger
 * /forgot_password:
 *   post:
 *     summary: Forgot password
 *     description: Endpoint to request a password reset email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: User not found
 */
router.post("/forgot_password", (req, res) => authController.forgotPassword(req, res));

/**
 * @swagger
 * /reset_password:
 *   post:
 *     summary: Reset password
 *     description: Endpoint to reset user password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: User not found
 */
router.post("/reset_password", (req, res) => authController.resetPassword(req, res));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Endpoint to create a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request body
 */
router.post("/users", (req, res) => userController.postNew(req, res));

/**
 * @swagger
 * /cycles:
 *   post:
 *     summary: Create a new cycle
 *     description: Endpoint to create a new cycle for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               ovulation:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Cycle created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post("/cycles", (req, res) => cycleController.createCycle(req, res));

export default router;
