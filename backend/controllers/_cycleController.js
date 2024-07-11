import { Cycle, User } from '../models/index.js';
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
            const menstruationEnd = new Date(startDateObj.getTime() + flowLength * 24 * 60 * 60 * 1000); // Calculate end of menstruation

            // Calculate ovulation date based on average cycle length (14 days after menstruation starts)
            const ovulationDate = new Date(menstruationEnd.getTime() + 14 * 24 * 60 * 60 * 1000);

            // Calculate next cycle start date based on average cycle length plus menstruation length
            const nextCycleStartDate = new Date(ovulationDate.getTime() + 14 * 24 * 60 * 60 * 1000);

            const newCycle = new Cycle({
                userId: user._id,
                startDate: startDateObj,
                flowLength,
                predictedCycleLength: 14 + flowLength, // Update to include menstruation length in the cycle length
                previousCycleLengths: [], // Initialize as empty array
                irregularCycle: false // Assume regular cycle unless proven otherwise
            });

            await newCycle.save();
            responseHandler(res, HttpStatus.OK, 'success', 'Ovulation prediction successful.', {
                ovulationDate,
                nextCycleStartDate,
                predictedCycleLength: 14 + flowLength // Include menstruation length in the cycle length
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
                stdDev,
                nextCycleStartDate
            });
        } catch (error) {
            console.error('Error updating cycle data:', error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Error updating cycle data', { error });
        }
    }
};

export default CycleController;
