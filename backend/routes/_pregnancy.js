import express from "express";
import { PregnancyController } from "../controllers/index.js";
import { authenticationVerifier, checkExistingPregnancy } from "../middlewares/index.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pregnancies
 *   description: User pregnancy management
 */

/**
 * @swagger
 * /api/v1/pregnancies:
 *   post:
 *     summary: Create pregnancy
 *     description: Record a new pregnancy for the user
 *     tags: [Pregnancies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastMenstruationDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the last menstruation
 *     responses:
 *       201:
 *         description: Pregnancy recorded successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       409:
 *         description: Conflict - Active pregnancy already exists
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticationVerifier, checkExistingPregnancy, Pregnancy.createPregnancy);

/**
 * @swagger
 * /api/v1/pregnancies/{pregnancyId}:
 *   get:
 *     summary: Get pregnancy
 *     description: Retrieve a specific pregnancy by ID
 *     tags: [Pregnancies]
 *     parameters:
 *       - in: path
 *         name: pregnancyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The pregnancy ID
 *     responses:
 *       200:
 *         description: Pregnancy retrieved successfully
 *       404:
 *         description: Pregnancy not found
 *       500:
 *         description: Internal server error
 */
router.get("/:pregnancyId", authenticationVerifier, Pregnancy.getPregnancy);

/**
 * @swagger
 * /api/v1/pregnancies:
 *   get:
 *     summary: Get all pregnancies
 *     description: Retrieve all pregnancies for the authenticated user
 *     tags: [Pregnancies]
 *     responses:
 *       200:
 *         description: Pregnancies retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticationVerifier, Pregnancy.getAllPregnancies);

/**
 * @swagger
 * /api/v1/pregnancies/{pregnancyId}:
 *   delete:
 *     summary: Delete a pregnancy
 *     description: Delete a specific pregnancy by ID
 *     tags: [Pregnancies]
 *     parameters:
 *       - in: path
 *         name: pregnancyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The pregnancy ID
 *     responses:
 *       200:
 *         description: Pregnancy deleted successfully
 *       404:
 *         description: Pregnancy not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:pregnancyId", authenticationVerifier, Pregnancy.deletePregnancy);

export default router;
