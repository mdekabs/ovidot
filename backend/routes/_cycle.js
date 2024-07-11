import express from 'express';
import Joi from 'joi';
import { authenticationVerifier } from '../middlewares/_verifyToken.js';
import { CycleController } from '../controllers/index.js';
import validateRequest from '../middlewares/_validateRequest.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cycles
 *   description: User cycle management
 */

// Define schema for predicting ovulation
const predictOvulationSchema = Joi.object({
    startDate: Joi.date().required(),
    flowLength: Joi.number().required()
});

/**
 * @swagger
 * /api/v1/cycles/predict:
 *   post:
 *     summary: Predict ovulation
 *     description: Predict ovulation date and cycle length based on user data
 *     tags: [Cycles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the menstrual cycle
 *               flowLength:
 *                 type: number
 *                 description: Length of menstrual flow in days
 *     responses:
 *       200:
 *         description: Ovulation predicted successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/predict', authenticationVerifier, validateRequest(predictOvulationSchema), CycleController.predictOvulation);

// Define schema for updating user cycle
const updateCycleSchema = Joi.object({
    actualOvulationDate: Joi.date().required(),
    flowLength: Joi.number().required()
});

/**
 * @swagger
 * /api/v1/cycles/update:
 *   post:
 *     summary: Update user cycle
 *     description: Update user cycle details including actual ovulation date and start date
 *     tags: [Cycles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actualOvulationDate:
 *                 type: string
 *                 format: date
 *                 description: The actual ovulation date
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the new cycle
 *     responses:
 *       200:
 *         description: User cycle updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/update', authenticationVerifier, validateRequest(updateCycleSchema), CycleController.updateCycle);

export default router;
