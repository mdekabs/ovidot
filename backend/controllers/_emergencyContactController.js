import { EmergencyContact } from "../models/index.js";
import { responseHandler } from "../utils/index.js";
import HttpStatus from "http-status-codes";

const EmergencyContactController = {
    createEmergencyContact: async (req, res) => {
        try {
            const { contactName, contactNumber, relationship } = req.body;
            const userId = req.user.id;

            // Check if an emergency contact already exists for this user
            const existingContact = await EmergencyContact.findOne({ userId });

            if (existingContact) {
                return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "Emergency contact already exists. Please update the existing contact.", { existingContact });
            }

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

    updateEmergencyContact: async (req, res) => {
        try {
            const { contactName, contactNumber, relationship } = req.body;
            const userId = req.user.id;

            const updatedContact = await EmergencyContact.findOneAndUpdate(
                { userId },
                { contactName, contactNumber, relationship },
                { new: true }
            );

            if (!updatedContact) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Emergency contact not found. Please create one first.");
            }

            return responseHandler(res, HttpStatus.OK, "success", "Emergency contact updated successfully.", { updatedContact });
        } catch (error) {
            console.error("Error updating emergency contact:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Error updating emergency contact", { error });
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
