import express from "express";
import Joi from "joi";
import { authenticationVerifier, validateRequest } from "../middlewares/index.js";
import { EmergencyContactController } from "../controllers/index.js";

const router = express.Router();

// Define schema for emergency contact creation
const emergencyContactSchema = Joi.object({
    contactName: Joi.string().required(),
    contactNumber: Joi.string().required(),
    relationship: Joi.string().required()
});

/**
 * @swagger
 * tags:
 *   name: Emergency Contacts
 *   description: Managing emergency contacts
 */

/**
 * @swagger
 * /api/v1/emergency-contacts:
 *   post:
 *     summary: Create emergency contact
 *     description: Create a new emergency contact for the authenticated user
 *     tags: [Emergency Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactName:
 *                 type: string
 *                 description: Name of the emergency contact
 *               contactNumber:
 *                 type: string
 *                 description: Phone number of the emergency contact
 *               relationship:
 *                 type: string
 *                 description: Relationship with the emergency contact
 *     responses:
 *       200:
 *         description: Emergency contact created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticationVerifier, validateRequest(emergencyContactSchema), EmergencyContactController.createEmergencyContact);

/**
 * @swagger
 * /api/v1/emergency-contacts:
 *   get:
 *     summary: Get emergency contacts
 *     description: Retrieve all emergency contacts for the authenticated user
 *     tags: [Emergency Contacts]
 *     responses:
 *       200:
 *         description: Emergency contacts retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticationVerifier, EmergencyContactController.getEmergencyContacts);

export default router;
