import { Feedback } from "../models/index.js";
import { responseHandler } from "../utils/index.js";

const FeedbackController = {
    submitFeedback: async (req, res) => {
        try {
            const { cycleId, accuracy, comments } = req.body;
            const userId = req.user.id;

            const feedback = new Feedback({
                userId,
                cycleId,
                accuracy,
                comments
            });

            await feedback.save();
            responseHandler(res, HttpStatus.CREATED, "success", "Feedback submitted successfully.");
        } catch (error) {
            console.error("Error submitting feedback:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error submitting feedback", { error });
        }
    },

    getFeedbackForCycle: async (req, res) => {
        try {
            const { cycleId } = req.params;
            const feedbacks = await Feedback.find({ cycleId });

            if (!feedbacks.length) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "No feedback found for this cycle");
            }

            responseHandler(res, HttpStatus.OK, "success", "Feedback retrieved successfully", feedbacks);
        } catch (error) {
            console.error("Error retrieving feedback:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving feedback", { error });
        }
    }
};

export default FeedbackController;
