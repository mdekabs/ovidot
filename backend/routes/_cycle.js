import express from "express";
import Joi from "joi";
import { authenticationVerifier, validateRequest } from "../middlewares/index.js";
import { CycleController } from "../controllers/index.js";

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
 * /cycles/predict:
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
router.post('/predict', authenticationVerifier, validateRequest(predictOvulationSchema), CycleController.createCycle);

// Define schema for updating user cycle
const updateCycleSchema = Joi.object({
    actualOvulationDate: Joi.date().required(),
    actualFlowLength: Joi.number().required(),
    feedback: Joi.object({
        accuracy: Joi.number().min(1).max(5).required(),
        comments: Joi.string()
    }).optional()
});

/**
 * @swagger
 * /cycles/update:
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
 *               actualFlowLength:
 *                 type: number
 *                 description: Length of menstrual flow in days
 *               feedback:
 *                 type: object
 *                 properties:
 *                   accuracy:
 *                     type: number
 *                     description: Feedback accuracy rating (1-5)
 *                   comments:
 *                     type: string
 *                     description: Additional comments
 *     responses:
 *       200:
 *         description: User cycle updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/update', authenticationVerifier, validateRequest(updateCycleSchema), CycleController.updateCycle);

/**
 * @swagger
 * /cycles/{cycleId}:
 *   delete:
 *     summary: Delete a cycle
 *     description: Delete a specific cycle by ID
 *     tags: [Cycles]
 *     parameters:
 *       - in: path
 *         name: cycleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cycle ID
 *     responses:
 *       200:
 *         description: Cycle deleted successfully
 *       404:
 *         description: Cycle not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:cycleId', authenticationVerifier, CycleController.deleteCycle);

/**
 * @swagger
 * /cycles/{cycleId}:
 *   get:
 *     summary: Get a cycle
 *     description: Retrieve a specific cycle by ID
 *     tags: [Cycles]
 *     parameters:
 *       - in: path
 *         name: cycleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cycle ID
 *     responses:
 *       200:
 *         description: Cycle retrieved successfully
 *       404:
 *         description: Cycle not found
 *       500:
 *         description: Internal server error
 */
router.get('/:cycleId', authenticationVerifier, CycleController.getCycle);

/**
 * @swagger
 * /cycles:
 *   get:
 *     summary: Get all cycles
 *     description: Retrieve all cycles for the authenticated user
 *     tags: [Cycles]
 *     responses:
 *       200:
 *         description: Cycles retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticationVerifier, CycleController.getAllCycles);

/**
 * @swagger
 * /cycles/{year}/{month}:
 *   get:
 *     summary: Get cycles by month
 *     description: Retrieve cycles for the authenticated user for a specific month and year
 *     tags: [Cycles]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: The year to filter cycles
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: The month to filter cycles
 *     responses:
 *       200:
 *         description: Cycles retrieved successfully
 *       404:
 *         description: Cycles not found
 *       500:
 *         description: Internal server error
 */
router.get('/:year/:month', authenticationVerifier, CycleController.getCyclesByMonth);

export default router;
