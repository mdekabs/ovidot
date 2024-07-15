import express from "express";
import Joi from "joi";
import { authenticationVerifier, validateRequest } from "../middlewares/index.js";
import {MoodController} from "../controllers/index.js";

const router = express.Router();

const moodEntrySchema = Joi.object({
    mood: Joi.string().required(),
    symptoms: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
});

router.post('/', authenticationVerifier, validateRequest(moodEntrySchema), MoodController.createMoodEntry);
router.get('/', authenticationVerifier, MoodController.getMoodEntries);

export default router;
