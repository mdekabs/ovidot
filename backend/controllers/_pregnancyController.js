import { Cycle, User, Pregnancy } from "../models/index.js";
import { isUserPregnant, responseHandler, calculateEDD, calculateFertileWindow } from "../utils/index.js";
import HttpStatus from "http-status-codes";

const PregnancyController = {
    createPregnancy: async (req, res) => {
        try {
            const userId = req.user.id;
            const { manualPregnancy, manualDate } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            let ovulationDate;

            if (manualPregnancy && manualDate) {
                // Use the manual date if provided
                ovulationDate = new Date(manualDate);
            } else {
                // Use isUserPregnant utility function to check pregnancy status
                const { pregnant, cycle } = await isUserPregnant(userId);
                if (pregnant) {
                    if (cycle) {
                        ovulationDate = cycle.actualOvulationDate;
                    } else {
                        // Already pregnant, no need to create a new record
                        return responseHandler(res, HttpStatus.CONFLICT, "error", "User already has a pregnancy record.");
                    }
                } else {
                    return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Cannot record pregnancy as cycle data does not indicate a missed period.");
                }
            }

            const edd = calculateEDD(ovulationDate);
            const { fertileStart, fertileEnd } = calculateFertileWindow(ovulationDate);

            const newPregnancy = new Pregnancy({
                userId,
                lastOvulationDate: ovulationDate,
                edd,
                recordedAt: new Date(),
                manualInput: manualPregnancy && manualDate ? true : false,
                fertileStart,
                fertileEnd
            });

            await newPregnancy.save();
            return responseHandler(res, HttpStatus.CREATED, "success", "Pregnancy recorded successfully.", { edd, fertileStart, fertileEnd });
        } catch (error) {
            console.error("Error creating pregnancy:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error creating pregnancy", { error });
        }
    },

    getPregnancy: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const pregnancies = await Pregnancy.find({ userId });
            if (!pregnancies || pregnancies.length === 0) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "No pregnancies found");
            }

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
