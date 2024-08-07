import { Cycle } from '../models/index.js';

export const checkCycleExistsForMonth = async (userId, startDate) => {
    const startDateObj = new Date(startDate);
    const month = `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`;

    // Fetch cycles for the user; decryption is handled by Mongoose's post('init') middleware
    const cycles = await Cycle.find({ userId });

    // Check if any cycle's month matches the given month
    for (const cycle of cycles) {
        if (cycle.month === month) {
            return true;
        }
    }

    return false;
};
