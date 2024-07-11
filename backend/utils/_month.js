import { Cycle } from '../models/index.js';

export const checkCycleExistsForMonth = async (userId, startDate) => {
    const startDateObj = new Date(startDate);
    const month = `${startDateObj.getFullYear()}-${startDateObj.getMonth() + 1}`;

    const existingCycle = await Cycle.findOne({
        userId: userId,
        month: month
    });

    return existingCycle !== null;
};
