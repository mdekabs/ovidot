import dotenv from "dotenv";
import HttpStatus from "http-status-codes";
import { Cycle, User } from "../models/index.js";
import { 
  responseHandler,
  calculateStandardDeviation, 
  calculateCycleDates, 
  calculateDynamicThreshold, 
  checkIrregularity, 
  adjustPredictionBasedOnHistory,
  checkCycleExistsForMonth,
  adjustPredictionBasedOnFeedback,
  isDateInCurrentMonth,
  CONSTANTS
} from '../utils/index.js';

dotenv.config();

const { OVULATION_INTERVAL_DAYS, MILLISECONDS_IN_A_DAY } = CONSTANTS;

// Enhanced Cycle Controller
const CycleController = {
    createCycle: async (req, res) => {
        try {
            const { startDate, flowLength } = req.body;
            const userId = req.user.id;

            if (!isDateInCurrentMonth(startDate)) {
                return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Start date must be within the current month.");
            }

            const [user, existingCycle] = await Promise.all([
                User.findById(userId),
                checkCycleExistsForMonth(userId, startDate)
            ]);

            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            if (existingCycle) {
                return responseHandler(res, HttpStatus.CONFLICT, "error", "A cycle already exists for this month");
            }

            const previousCycles = await Cycle.find({ userId });
            const predictedCycleLength = adjustPredictionBasedOnHistory(previousCycles, OVULATION_INTERVAL_DAYS, flowLength);
            const finalPredictedCycleLength = await adjustPredictionBasedOnFeedback(userId, predictedCycleLength);

            const { startDateObj, ovulationDate, nextCycleStartDate } = calculateCycleDates(startDate, flowLength);
            const isIrregular = checkIrregularity(previousCycles.map(cycle => cycle.predictedCycleLength), predictedCycleLength, flowLength);

            const newCycle = new Cycle({
                userId,
                startDate: startDateObj,
                flowLength: flowLength,
                predictedCycleLength: finalPredictedCycleLength,
                previousCycleLengths: previousCycles.map(cycle => cycle.predictedCycleLength),
                irregularCycle: isIrregular,
                ovulationDate: ovulationDate,
                nextCycleStartDate: nextCycleStartDate,
                month: `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`
            });

            await newCycle.save();
            responseHandler(res, HttpStatus.CREATED, "success", "Cycle created successfully.", {
                ovulationDate,
                nextCycleStartDate,
                predictedCycleLength: finalPredictedCycleLength,
                isIrregular,
                totalCycleLength: finalPredictedCycleLength + flowLength
            });
        } catch (error) {
            console.error("Error creating cycle:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error creating cycle", { error });
        }
    },

    updateCycle: async (req, res) => {
        try {
            const { actualOvulationDate, actualFlowLength } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const userCycle = await Cycle.findOne({ userId: user._id }).sort({ startDate: -1 }).exec();
            if (!userCycle) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "No cycle data found for user.");
            }

            const startDateObj = new Date(userCycle.startDate);
            const actualOvulationDateObj = new Date(actualOvulationDate);

            if (actualOvulationDateObj < startDateObj) {
                return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Actual ovulation date cannot be before the start date.");
            }

            const nextCycleStartDate = new Date(actualOvulationDateObj.getTime() + OVULATION_INTERVAL_DAYS * MILLISECONDS_IN_A_DAY);
            const actualCycleLength = Math.round((nextCycleStartDate - startDateObj) / MILLISECONDS_IN_A_DAY);

            const previousCycleLengths = [...userCycle.previousCycleLengths, actualCycleLength];
            const mean = previousCycleLengths.reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
            const stdDev = calculateStandardDeviation(previousCycleLengths);
            const dynamicThreshold = calculateDynamicThreshold(previousCycleLengths);
            const isIrregular = Math.abs(actualCycleLength - mean) > dynamicThreshold;

            userCycle.flowLength = actualFlowLength;
            userCycle.actualOvulationDate = actualOvulationDateObj;
            userCycle.nextCycleStartDate = nextCycleStartDate;
            userCycle.previousCycleLengths = previousCycleLengths;
            userCycle.irregularCycle = isIrregular;
            userCycle.month = `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`;

            await userCycle.save();
            responseHandler(res, HttpStatus.OK, "success", "Cycle data updated successfully.", {
                updatedCycleLength: actualCycleLength,
                isIrregular,
                stdDev,
                nextCycleStartDate,
                totalCycleLength: userCycle.predictedCycleLength + userCycle.flowLength
            });
        } catch (error) {
            console.error("Error updating cycle data:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error updating cycle data", { error });
        }
    },

    deleteCycle: async (req, res) => {
        try {
            const userId = req.user.id;
            const { cycleId } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const cycle = await Cycle.findOneAndDelete({ userId, _id: cycleId });
            if (!cycle) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Cycle not found");
            }

            responseHandler(res, HttpStatus.OK, "success", "Cycle deleted successfully");
        } catch (error) {
            console.error("Error deleting cycle:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error deleting cycle", { error });
        }
    },

    getCycle: async (req, res) => {
        try {
            const userId = req.user.id;
            const { cycleId } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const cycle = await Cycle.findById(cycleId);
            if (!cycle) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Cycle not found");
            }

            responseHandler(res, HttpStatus.OK, "success", "Cycle retrieved successfully", cycle);
        } catch (error) {
            console.error("Error retrieving cycle:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving cycle", { error });
        }
    },

    getAllCycles: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const cycles = await Cycle.find({ userId });

            responseHandler(res, HttpStatus.OK, "success", "Cycles retrieved successfully", cycles);
        } catch (error) {
            console.error("Error retrieving cycles:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving cycles", { error });
        }
    },

    getCyclesByMonth: async (req, res) => {
        try {
            const userId = req.user.id;
            const { month } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const cycles = await Cycle.find({ userId, month });

            responseHandler(res, HttpStatus.OK, "success", "Cycles retrieved successfully", cycles);
        } catch (error) {
            console.error("Error retrieving cycles by month:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving cycles by month", { error });
        }
    }
};

export default CycleController;
