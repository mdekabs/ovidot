const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
const PREGNANCY_DURATION_DAYS = 280;

const calculateEDD = (lastOvulationDate) => {
    const lastOvulationDateObj = new Date(lastOvulationDate);
    return new Date(lastOvulationDateObj.getTime() + PREGNANCY_DURATION_DAYS * MILLISECONDS_IN_A_DAY);
};

export default calculateEDD;
