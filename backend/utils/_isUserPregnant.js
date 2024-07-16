import { Cycle, Pregnancy } from "../models/index.js";

const isUserPregnant = async (userId) => {
    try {
        // Check if there is an existing pregnancy record
        const pregnancies = await Pregnancy.find({ userId });
        if (pregnancies.length > 0) {
            return { pregnant: true, pregnancies };
        }

        // Check for missed period in the latest cycle
        const latestCycle = await Cycle.findOne({ userId }).sort({ startDate: -1 }).exec();
        if (latestCycle) {
            const { nextCycleStartDate, actualFlowLength } = latestCycle;
            if (nextCycleStartDate < new Date() && !actualFlowLength) {
                return { pregnant: true, cycle: latestCycle };
            }
        }

        return { pregnant: false };
    } catch (error) {
        console.error("Error determining pregnancy status:", error);
        throw new Error("Error determining pregnancy status");
    }
};

export default isUserPregnant;
