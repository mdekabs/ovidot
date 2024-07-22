import express from "express";
import Joi from "joi";
import { authenticationVerifier, validateRequest } from "../middlewares/index.js";
import { MoodController } from "../controllers/index.js";

const router = express.Router();

// Define schema for mood entry creation
const moodEntrySchema = Joi.object({
    mood: Joi.string().required(),
    symptoms: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
});

/**
 * @swagger
 * tags:
 *   name: Mood Entries
 *   description: Managing mood entries
 */

/**
 * @swagger
 * /mood:
 *   post:
 *     summary: Create mood entry
 *     description: Create a new mood entry for the authenticated user
 *     tags: [Mood Entries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mood:
 *                 type: string
 *                 description: Mood category (e.g., happy, sad, anxious)
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional symptoms associated with the mood
 *               notes:
 *                 type: string
 *                 description: Optional notes related to the mood
 *     responses:
 *       200:
 *         description: Mood entry created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticationVerifier, validateRequest(moodEntrySchema), MoodController.createMoodEntry);

/**
 * @swagger
 * /mood:
 *   get:
 *     summary: Get mood entries
 *     description: Retrieve all mood entries for the authenticated user
 *     tags: [Mood Entries]
 *     responses:
 *       200:
 *         description: Mood entries retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticationVerifier, MoodController.getMoodEntries);

export default router;
