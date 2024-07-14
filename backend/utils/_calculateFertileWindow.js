const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

const calculateFertileWindow = (ovulationDate) => {
    const ovulationDateObj = new Date(ovulationDate);
    const fertileStart = new Date(ovulationDateObj.getTime() - 5 * MILLISECONDS_IN_A_DAY);
    const fertileEnd = new Date(ovulationDateObj.getTime() + 1 * MILLISECONDS_IN_A_DAY);
    return { fertileStart, fertileEnd };
};

export default calculateFertileWindow;
