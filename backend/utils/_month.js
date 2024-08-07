import { Cycle } from '../models/index.js';
import { decryptData } from '../utils/index.js'; // Ensure this path is correct
import dotenv from "dotenv";

dotenv.config();
const encryptionKey = process.env.ENCRYPTION_KEY;

export const checkCycleExistsForMonth = async (userId, startDate) => {
    const startDateObj = new Date(startDate);
    const month = `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`;

    const cycles = await Cycle.find({ userId });

    for (const cycle of cycles) {
        const decryptedMonth = decryptData(cycle.month, encryptionKey);
        if (decryptedMonth === month) {
            return true;
        }
    }

    return false;
};
