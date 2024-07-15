import { MoodEntry } from "../models/index.js";
import { responseHandler } from "../utils/index.js";
import HttpStatus from "http-status-codes";

const MoodController = {
    createMoodEntry: async (req, res) => {
        try {
            const { mood, symptoms, notes } = req.body;
            const userId = req.user.id;

            const newMoodEntry = new MoodEntry({
                userId,
                mood,
                symptoms,
                notes
            });

            await newMoodEntry.save();
            return responseHandler(res, HttpStatus.CREATED, "success", "Mood entry recorded successfully.", { newMoodEntry });
        } catch (error) {
            console.error("Error creating mood entry:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error creating mood entry", { error });
        }
    },
    
    getMoodEntries: async (req, res) => {
        try {
            const userId = req.user.id;
            const moodEntries = await MoodEntry.find({ userId });
            return responseHandler(res, HttpStatus.OK, "success", "Mood entries retrieved successfully", { moodEntries });
        } catch (error) {
            console.error("Error retrieving mood entries:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving mood entries", { error });
        }
    }
};

export default MoodController;
