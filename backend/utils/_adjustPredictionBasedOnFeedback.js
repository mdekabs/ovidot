import {Feedback} from '../models/index.js';

// Adjust prediction based on feedback
export const adjustPredictionBasedOnFeedback = async (userId, predictedCycleLength) => {
    try {
        const feedbacks = await Feedback.find({ userId });

        if (feedbacks.length > 0) {
            const totalAccuracy = feedbacks.reduce((acc, feedback) => acc + feedback.accuracy, 0);
            const averageAccuracy = totalAccuracy / feedbacks.length;

            // Adjust prediction: Higher accuracy leads to smaller adjustments, lower accuracy leads to larger adjustments
            const adjustmentFactor = (5 - averageAccuracy) / 5; // Example: Average accuracy of 3 would lead to an adjustmentFactor of 0.4
            const adjustedPrediction = predictedCycleLength * (1 + adjustmentFactor);

            return adjustedPrediction;
        }

        return predictedCycleLength;
    } catch (error) {
        console.error('Error adjusting prediction based on feedback:', error);
        throw error;
    }
};
