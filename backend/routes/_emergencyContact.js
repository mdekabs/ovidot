import express from "express";
import Joi from "joi";
import { authenticationVerifier, validateRequest } from "../middlewares/index.js";
import {EmergencyContactController} from "../controllers/index.js";

const router = express.Router();

const emergencyContactSchema = Joi.object({
    contactName: Joi.string().required(),
    contactNumber: Joi.string().required(),
    relationship: Joi.string().required()
});

router.post('/', authenticationVerifier, validateRequest(emergencyContactSchema), EmergencyContactController.createEmergencyContact);
router.get('/', authenticationVerifier, EmergencyContactController.getEmergencyContacts);

export default router;
