import { Cycle, User } from "../models/index.js";
import { responseHandler, checkCycleExistsForMonth, isDateInCurrentMonth } from "../utils/index.js";
import HttpStatus from "http-status-codes";

// Constants
const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
const IRREGULAR_THRESHOLD = 7;
const OVULATION_INTERVAL_DAYS = 14;

const calculateStandardDeviation = (arr) => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    const variance = arr.map(val => Math.pow(val - mean, 2)).reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(variance);
};

const calculateCycleDates = (startDate, flowLength) => {
    const startDateObj = new Date(startDate);
    const menstruationEnd = new Date(startDateObj.getTime() + flowLength * MILLISECONDS_IN_A_DAY);
    const ovulationDate = new Date(menstruationEnd.getTime() + OVULATION_INTERVAL_DAYS * MILLISECONDS_IN_A_DAY);
    const nextCycleStartDate = new Date(ovulationDate.getTime() + OVULATION_INTERVAL_DAYS * MILLISECONDS_IN_A_DAY);
    return { startDateObj, menstruationEnd, ovulationDate, nextCycleStartDate };
};

const checkIrregularity = (previousCycleLengths, predictedCycleLength, flowLength) => {
    if (previousCycleLengths.length === 0) return false;
    const mean = previousCycleLengths.reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
    const stdDev = calculateStandardDeviation(previousCycleLengths);
    return Math.abs(predictedCycleLength + flowLength - mean) > IRREGULAR_THRESHOLD;
};

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

            const { startDateObj, ovulationDate, nextCycleStartDate } = calculateCycleDates(startDate, flowLength);

            const previousCycles = await Cycle.find({ userId });
            const previousCycleLengths = previousCycles.map(cycle => cycle.predictedCycleLength);

            const predictedCycleLength = OVULATION_INTERVAL_DAYS + flowLength;
            const isIrregular = checkIrregularity(previousCycleLengths, predictedCycleLength, flowLength);

            const newCycle = new Cycle({
                userId,
                startDate: startDateObj,
                flowLength,
                predictedCycleLength,
                previousCycleLengths: [],
                irregularCycle: isIrregular,
                ovulationDate,
                nextCycleStartDate,
                month: `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`
            });

            await newCycle.save();
            responseHandler(res, HttpStatus.CREATED, "success", "Cycle created successfully.", {
                ovulationDate,
                nextCycleStartDate,
                predictedCycleLength,
                isIrregular,
                totalCycleLength: predictedCycleLength + flowLength
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

            const startDateObj = userCycle.startDate;
            const actualOvulationDateObj = new Date(actualOvulationDate);

            // Validate actualOvulationDate
            if (actualOvulationDateObj < startDateObj) {
                return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Actual ovulation date cannot be before the start date.");
            }
            if (!isDateInCurrentMonth(startDate)) {
                return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Cannot update cycle to a previous or future month.");
            }

            const nextCycleStartDate = new Date(actualOvulationDateObj.getTime() + OVULATION_INTERVAL_DAYS * MILLISECONDS_IN_A_DAY);
            const actualCycleLength = Math.round((nextCycleStartDate - startDateObj) / MILLISECONDS_IN_A_DAY);

            const previousCycleLengths = [...userCycle.previousCycleLengths, actualCycleLength];
            const mean = previousCycleLengths.reduce((acc, val) => acc + val, 0) / previousCycleLengths.length;
            const stdDev = calculateStandardDeviation(previousCycleLengths);
            const isIrregular = Math.abs(actualCycleLength - mean) > IRREGULAR_THRESHOLD;

            userCycle.flowLength = actualFlowLength;
            userCycle.actualOvulationDate = actualOvulationDateObj;
            userCycle.nextCycleStartDate = nextCycleStartDate;
            userCycle.previousCycleLengths = previousCycleLengths;
            userCycle.irregularCycle = isIrregular;
            userCycle.month = `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`; // Ensure month is set during update

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

            const cycle = await Cycle.findOne({ userId, _id: cycleId });
            if (!cycle) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Cycle not found");
            }

            responseHandler(res, HttpStatus.OK, "success", "Cycle retrieved successfully", { cycle });
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
            responseHandler(res, HttpStatus.OK, "success", "Cycles retrieved successfully", { cycles });
        } catch (error) {
            console.error("Error retrieving cycles:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving cycles", { error });
        }
    },

    getCyclesByMonth: async (req, res) => {
        try {
            const userId = req.user.id;
            const { year, month } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            const cycles = await Cycle.find({
                userId,
                startDate: { $gte: startDate, $lt: endDate }
            });

            responseHandler(res, HttpStatus.OK, "success", "Cycles retrieved successfully", { cycles });
        } catch (error) {
            console.error("Error retrieving cycles by month:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving cycles by month", { error });
        }
    }
};

export default CycleController;
