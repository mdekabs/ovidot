import { Feedback } from "../models/index.js";

// Constants
const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_IRREGULAR_THRESHOLD = 7;
const OVULATION_INTERVAL_DAYS = 14;

// Group constants into an object
const CONSTANTS = {
    MILLISECONDS_IN_A_DAY,
    DEFAULT_IRREGULAR_THRESHOLD,
    OVULATION_INTERVAL_DAYS
};

export { CONSTANTS };

export const calculateStandardDeviation = (arr) => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    const variance = arr.map(val => Math.pow(val - mean, 2)).reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(variance);
};

export const calculateCycleDates = (startDate, flowLength) => {
    const { MILLISECONDS_IN_A_DAY, OVULATION_INTERVAL_DAYS } = CONSTANTS;
    const startDateObj = new Date(startDate);
    const menstruationEnd = new Date(startDateObj.getTime() + flowLength * MILLISECONDS_IN_A_DAY);
    const ovulationDate = new Date(menstruationEnd.getTime() + OVULATION_INTERVAL_DAYS * MILLISECONDS_IN_A_DAY);
    const nextCycleStartDate = new Date(ovulationDate.getTime() + OVULATION_INTERVAL_DAYS * MILLISECONDS_IN_A_DAY);
    return { startDateObj, menstruationEnd, ovulationDate, nextCycleStartDate };
};

export const calculateDynamicThreshold = (previousCycleLengths) => {
    const { DEFAULT_IRREGULAR_THRESHOLD } = CONSTANTS;
    const stdDev = calculateStandardDeviation(previousCycleLengths);
    return stdDev > 0 ? stdDev * 1.5 : DEFAULT_IRREGULAR_THRESHOLD;
};

export const checkIrregularity = (previousCycleLengths, predictedCycleLength, flowLength) => {
    if (previousCycleLengths.length === 0) return false;
    const mean = previousCycleLengths.reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
    const dynamicThreshold = calculateDynamicThreshold(previousCycleLengths);
    return Math.abs(predictedCycleLength + flowLength - mean) > dynamicThreshold;
};

export const adjustPredictionBasedOnHistory = (previousCycles, predictedCycleLength, flowLength) => {
    const cycleLengths = previousCycles.map(cycle => cycle.predictedCycleLength);
    if (cycleLengths.length === 0) {
        return predictedCycleLength; // If no previous cycles, return the provided predictedCycleLength
    }

    const validCycleLengths = cycleLengths.filter(length => typeof length === 'number' && !isNaN(length));
    if (validCycleLengths.length === 0) {
        return predictedCycleLength; // If all values are invalid, return the provided predictedCycleLength
    }

    const averageLength = validCycleLengths.reduce((acc, val) => acc + val, 0) / validCycleLengths.length;
    return (predictedCycleLength + averageLength) / 2;
};

export const adjustPredictionBasedOnFeedback = async (userId, predictedCycleLength) => {
    if (typeof predictedCycleLength !== 'number' || isNaN(predictedCycleLength)) {
        console.error('Invalid predictedCycleLength:', predictedCycleLength);
        return predictedCycleLength; // Return as is or handle appropriately
    }

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
