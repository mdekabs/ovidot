import {EmergencyContact} from "../models/index.js";
import { responseHandler } from "../utils/index.js";
import HttpStatus from "http-status-codes";

const EmergencyContactController = {
    createEmergencyContact: async (req, res) => {
        try {
            const { contactName, contactNumber, relationship } = req.body;
            const userId = req.user.id;

            const newEmergencyContact = new EmergencyContact({
                userId,
                contactName,
                contactNumber,
                relationship
            });

            await newEmergencyContact.save();
            return responseHandler(res, HttpStatus.CREATED, "success", "Emergency contact added successfully.", { newEmergencyContact });
        } catch (error) {
            console.error("Error adding emergency contact:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error adding emergency contact", { error });
        }
    },
    
    getEmergencyContacts: async (req, res) => {
        try {
            const userId = req.user.id;
            const emergencyContacts = await EmergencyContact.find({ userId });
            return responseHandler(res, HttpStatus.OK, "success", "Emergency contacts retrieved successfully", { emergencyContacts });
        } catch (error) {
            console.error("Error retrieving emergency contacts:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error retrieving emergency contacts", { error });
        }
    }
};

export default EmergencyContactController;
