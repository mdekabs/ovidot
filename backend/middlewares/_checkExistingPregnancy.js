import { Pregnancy } from "../models/index.js";
import { responseHandler } from "../utils/index.js";
import HttpStatus from "http-status-codes";

const checkExistingPregnancy = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Check if there is an active pregnancy for the user
        const existingPregnancy = await Pregnancy.findOne({ userId }).sort({ recordedAt: -1 }).exec();

        if (existingPregnancy) {
            return responseHandler(res, HttpStatus.CONFLICT, "error", "Active pregnancy already exists");
        }

        next();
    } catch (error) {
        console.error("Error checking existing pregnancy:", error);
        responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error checking existing pregnancy", { error });
    }
};

export default checkExistingPregnancy;
