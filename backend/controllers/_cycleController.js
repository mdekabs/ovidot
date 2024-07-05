import { Cycle } from '../models/index.js';
import { responseHandler } from '../utils/index.js';
import HttpStatus from 'http-status-codes';

const CycleController = {
    createCycle: async (req, res) => {
        try {
            const { startDate, flowLength } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'User not found');
            }

            const startDateObj = new Date(startDate);
            const newCycle = new Cycle({
                userId: user._id,
                startDate: startDateObj,
                flowLength,
                predictedCycleLength: 28, // Default value until actual prediction
                previousCycleLengths: [],
                irregularCycle: false
            });

            await newCycle.save();
            responseHandler(res, HttpStatus.CREATED, 'success', 'Cycle created successfully.', { cycle: newCycle });
        } catch (error) {
            console.error('Error creating cycle:', error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Error creating cycle', { error });
        }
    },

    predictOvulation: async (req, res) => {
        try {
            const { startDate, flowLength } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'User not found');
            }

            const startDateObj = new Date(startDate);
            const userCycle = await Cycle.findOne({ userId: user._id }).sort({ startDate: -1 }).exec();

            let cycleLength = 28; // Default cycle length if no previous data is available
            if (userCycle && userCycle.previousCycleLengths.length > 0) {
                cycleLength = Math.round(userCycle.previousCycleLengths.reduce((a, b) => a + b, 0) / userCycle.previousCycleLengths.length);
            }

            const ovulationDate = new Date(startDateObj);
            ovulationDate.setDate(startDateObj.getDate() + Math.round(cycleLength / 2));

            const nextCycleStartDate = new Date(startDateObj);
            nextCycleStartDate.setDate(startDateObj.getDate() + cycleLength);

            const newCycle = new Cycle({
                userId: user._id,
                startDate: startDateObj,
                flowLength,
                predictedCycleLength: cycleLength,
                previousCycleLengths: userCycle ? userCycle.previousCycleLengths : [],
                irregularCycle: false // Assume regular cycle unless proven otherwise
            });

            await newCycle.save();
            responseHandler(res, HttpStatus.OK, 'success', 'Ovulation prediction successful.', {
                ovulationDate,
                nextCycleStartDate,
                predictedCycleLength: cycleLength
            });
        } catch (error) {
            console.error('Error predicting ovulation:', error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Error processing prediction', { error });
        }
    },

    updateCycle: async (req, res) => {
        try {
            const { startDate, actualOvulationDate } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'User not found');
            }

            const startDateObj = new Date(startDate);
            const actualOvulationDateObj = new Date(actualOvulationDate);
            const userCycle = await Cycle.findOne({ userId: user._id }).sort({ startDate: -1 }).exec();

            if (!userCycle) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'No cycle data found for user.');
            }

            const nextCycleStartDateObj = new Date(actualOvulationDateObj);
            nextCycleStartDateObj.setDate(actualOvulationDateObj.getDate() + userCycle.predictedCycleLength);

            const actualCycleLength = Math.round((nextCycleStartDateObj - startDateObj) / (1000 * 60 * 60 * 24));

            const previousCycleLengths = userCycle.previousCycleLengths;
            const mean = previousCycleLengths.reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
            const variance = previousCycleLengths.map(val => Math.pow(val - mean, 2)).reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
            const stdDev = Math.sqrt(variance);

            const irregularThreshold = 7;
            const isIrregular = Math.abs(actualCycleLength - mean) > irregularThreshold;

            userCycle.actualOvulationDate = actualOvulationDateObj;
            userCycle.nextCycleStartDate = nextCycleStartDateObj;
            userCycle.previousCycleLengths.push(actualCycleLength);
            userCycle.irregularCycle = isIrregular;

            await userCycle.save();

            responseHandler(res, HttpStatus.OK, 'success', 'Cycle data updated successfully.', {
                updatedCycleLength: actualCycleLength,
                isIrregular,
                stdDev
            });
        } catch (error) {
            console.error('Error updating cycle data:', error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Error updating cycle data', { error });
        }
    }
};
export default CycleController;

