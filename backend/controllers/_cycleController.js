import { Cycle, User } from '../models/index.js';
import { responseHandler, checkCycleExistsForMonth } from '../utils/index.js';
import HttpStatus from 'http-status-codes';

// Constants
const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
const IRREGULAR_THRESHOLD = 7;

const calculateStandardDeviation = (arr) => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    const variance = arr.map(val => Math.pow(val - mean, 2)).reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(variance);
};

const CycleController = {
    createCycle: async (req, res) => {
        try {
            const { startDate, flowLength } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'User not found');
            }

            // Check if a cycle already exists for the user in the given month
            const cycleExists = await checkCycleExistsForMonth(user._id, startDate);
            if (cycleExists) {
                return responseHandler(res, HttpStatus.CONFLICT, 'error', 'A cycle already exists for this month');
            }

            const startDateObj = new Date(startDate);
            const month = `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`;
            const menstruationEnd = new Date(startDateObj.getTime() + flowLength * MILLISECONDS_IN_A_DAY);
            const ovulationDate = new Date(menstruationEnd.getTime() + 14 * MILLISECONDS_IN_A_DAY);
            const nextCycleStartDate = new Date(ovulationDate.getTime() + 14 * MILLISECONDS_IN_A_DAY);

            const previousCycles = await Cycle.find({ userId: user._id });
            let isIrregular = false;
            if (previousCycles.length > 0) {
                const previousCycleLengths = previousCycles.map(cycle => cycle.predictedCycleLength);
                const mean = previousCycleLengths.reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
                const stdDev = calculateStandardDeviation(previousCycleLengths);
                isIrregular = Math.abs(14 + flowLength - mean) > IRREGULAR_THRESHOLD;
            }

            const predictedCycleLength = 14 + flowLength;
            const totalCycleLength = predictedCycleLength + flowLength;

            const newCycle = new Cycle({
                userId: user._id,
                startDate: startDateObj,
                flowLength,
                predictedCycleLength,
                previousCycleLengths: [],
                irregularCycle: isIrregular,
                ovulationDate,
                nextCycleStartDate,
                month: month // Ensure month is set during creation
            });

            await newCycle.save();
            responseHandler(res, HttpStatus.CREATED, 'success', 'Cycle created successfully.', {
                ovulationDate,
                nextCycleStartDate,
                predictedCycleLength,
                isIrregular,
                totalCycleLength
            });
        } catch (error) {
            console.error('Error creating cycle:', error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Error creating cycle', { error });
        }
    },

    updateCycle: async (req, res) => {
        try {
            const { actualOvulationDate, actualFlowLength } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'User not found');
            }

            // Find the latest cycle for the user
            const userCycle = await Cycle.findOne({ userId: user._id }).sort({ startDate: -1 }).exec();

            if (!userCycle) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'No cycle data found for user.');
            }

            // Use the start date from the latest cycle
            const startDateObj = userCycle.startDate;
            const actualOvulationDateObj = new Date(actualOvulationDate);

            // Update flow length and ovulation date
            userCycle.flowLength = actualFlowLength;
            userCycle.actualOvulationDate = actualOvulationDateObj;

            // Preserve existing month value
            const existingMonth = userCycle.month;

            // Calculate next cycle start date based on actual ovulation date and actual flow length
            const nextCycleStartDate = new Date(actualOvulationDateObj.getTime() + 14 * MILLISECONDS_IN_A_DAY);

            // Calculate actual cycle length in days
            const actualCycleLength = Math.round((nextCycleStartDate - startDateObj) / MILLISECONDS_IN_A_DAY);

            // Update previous cycle lengths and check for irregularity
            const previousCycleLengths = [...userCycle.previousCycleLengths, actualCycleLength];
            const mean = previousCycleLengths.reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
            const stdDev = calculateStandardDeviation(previousCycleLengths);
            const isIrregular = Math.abs(actualCycleLength - mean) > IRREGULAR_THRESHOLD;

            // Update cycle data
            userCycle.nextCycleStartDate = nextCycleStartDate;
            userCycle.previousCycleLengths = previousCycleLengths;
            userCycle.irregularCycle = isIrregular;
            userCycle.month = existingMonth; // Preserve existing month value

            // Save updated cycle
            await userCycle.save();

            // Respond with updated cycle data
            responseHandler(res, HttpStatus.OK, 'success', 'Cycle data updated successfully.', {
                updatedCycleLength: actualCycleLength,
                isIrregular,
                stdDev,
                nextCycleStartDate,
                totalCycleLength: userCycle.predictedCycleLength + userCycle.flowLength
            });
        } catch (error) {
            console.error('Error updating cycle data:', error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Error updating cycle data', { error });
        }
    }
};

export default CycleController;
