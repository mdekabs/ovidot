import { Cycle, User, Pregnancy } from "../models/index.js";
import { responseHandler, calculateFertileWindow, calculateEDD } from "../utils/index.js";
import HttpStatus from "http-status-codes";

const PregnancyController = {
    createPregnancy: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const latestCycle = await Cycle.findOne({ userId }).sort({ startDate: -1 }).exec();
            if (!latestCycle) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "No cycle data found for user.");
            }

            const { nextCycleStartDate, actualOvulationDate } = latestCycle;

            if (nextCycleStartDate < new Date() && !latestCycle.actualFlowLength) {
                const edd = calculateEDD(actualOvulationDate);

                const newPregnancy = new Pregnancy({
                    userId,
                    lastOvulationDate: actualOvulationDate,
                    edd,
                    recordedAt: new Date()
                });

                await newPregnancy.save();
                return responseHandler(res, HttpStatus.CREATED, "success", "Pregnancy recorded successfully.", { edd });
            }

            return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Cannot record pregnancy as cycle data does not indicate a missed period.");
        } catch (error) {
            console.error("Error creating pregnancy:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error creating pregnancy", { error });
        }
    },

    getPregnancy: async (req, res) => {
        try {
            const userId = req.user.id;
            const { pregnancyId } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const pregnancy = await Pregnancy.findOne({ userId, _id: pregnancyId });
            if (!pregnancy) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Pregnancy not found");
            }

            responseHandler(res, HttpStatus.OK, "success", "Pregnancy retrieved successfully", { pregnancy });
        } catch (error) {
            console.error("Error retrieving pregnancy:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving pregnancy", { error });
        }
    },

    getAllPregnancies: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const pregnancies = await Pregnancy.find({ userId });
            responseHandler(res, HttpStatus.OK, "success", "Pregnancies retrieved successfully", { pregnancies });
        } catch (error) {
            console.error("Error retrieving pregnancies:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving pregnancies", { error });
        }
    },

    deletePregnancy: async (req, res) => {
        try {
            const userId = req.user.id;
            const { pregnancyId } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const pregnancy = await Pregnancy.findOneAndDelete({ userId, _id: pregnancyId });
            if (!pregnancy) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Pregnancy not found");
            }

            responseHandler(res, HttpStatus.OK, "success", "Pregnancy deleted successfully");
        } catch (error) {
            console.error("Error deleting pregnancy:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error deleting pregnancy", { error });
        }
    }
};

export default PregnancyController;
