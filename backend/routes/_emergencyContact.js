import express from "express";
import Joi from "joi";
import { authenticationVerifier, validateRequest } from "../middlewares/index.js";
import { EmergencyContactController } from "../controllers/index.js";

const router = express.Router();

// Define schema for emergency contact creation and update
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
 * /emergency-contacts:
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
 *       201:
 *         description: Emergency contact created successfully
 *       400:
 *         description: Bad request - Invalid input data or contact already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticationVerifier, validateRequest(emergencyContactSchema), EmergencyContactController.createEmergencyContact);

/**
 * @swagger
 * /emergency-contacts:
 *   put:
 *     summary: Update emergency contact
 *     description: Update the emergency contact for the authenticated user
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
 *         description: Emergency contact updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       404:
 *         description: Emergency contact not found
 *       500:
 *         description: Internal server error
 */
router.put('/', authenticationVerifier, validateRequest(emergencyContactSchema), EmergencyContactController.updateEmergencyContact);

/**
 * @swagger
 * /emergency-contacts:
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
