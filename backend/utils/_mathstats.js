// utils.js

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
    const averageLength = cycleLengths.reduce((acc, val) => acc + val, 0) / cycleLengths.length;
    return (predictedCycleLength + averageLength) / 2;
};
