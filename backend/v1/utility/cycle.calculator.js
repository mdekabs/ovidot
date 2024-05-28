// CYCLE CALCULATOR

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate the estimated cycle for the individual.
 * Note: this calculator is based on the average 28 days cycle.
 * Proper estimation will be made in later versions from data provided
 * by users to get an accurate prediction.
 *
 * @param {Number} period - the number of days of menstruation
 * @param {Date} startDate - the beginning of the user cycle YYYY-MM-DD
 * @param {Date} ovulation - the day the user experienced ovulation in the cycle. YYYY-MM-DD
 * @returns {Promise} - a promise that resolves to an object with variables of days (cycle duration), periodRange,
 * ovulationRange, unsafeDays, and nextDate.
 */
export function calculate(period, startDate, ovulation = null) {
    return new Promise((resolve, reject) => {
        try {
            const dayOne = new Date(startDate);
            let dayLast;

            const periodRange = [];

            if (ovulation === null) {
                ovulation = new Date(dayOne);
                ovulation.setDate(dayOne.getDate() + 9 + period);
            } else {
                ovulation = new Date(ovulation);
                // check if ovulation occurs before or during period range.
                // if it does, throw an error
                dayLast = new Date(dayOne);
                dayLast.setDate(dayLast.getDate() + period - 1); // The last day of menstraution

                if (ovulation <= dayLast) {
                    const err = new Error("Invalid ovulation date: Can't occur before or during menstraution");
                    err.statusCode = 400;
                    reject(err);
                }
            }

            // Get the total cycle days
            const totalCycleDays = getTotalCycleDays(dayOne, ovulation);

            // Get the period range by adding each day.
            for (let i = 0; i < period; i++) {
                const currDate = new Date(dayOne);
                currDate.setDate(dayOne.getDate() + i);
                periodRange.push(formatDate(currDate));
            }

            // Calculate the predicted start date and end date for ovulation.
            const ovulationRange = getOvulationRange(ovulation, dayLast);

            // Calculate the unsafeRange
            const unsafeRange = getUnsafeRange(ovulation, new Date(periodRange[periodRange.length - 1]));

            let nextDate = new Date(dayOne);
            nextDate.setDate(dayOne.getDate() + totalCycleDays);
            nextDate = formatDate(nextDate);

            resolve({
                days: totalCycleDays,
                periodRange,
                ovulation: formatDate(ovulation),
                ovulationRange,
                unsafeDays: unsafeRange,
                nextDate
            });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Get the total number of days in the menstrual cycle.
 *
 * @param {Date} startDate - the beginning of the user cycle
 * @param {Date} ovulation - the day the user experienced ovulation
 * @returns {Number} - the total number of days in the cycle
 */
const getTotalCycleDays = (startDate, ovulation) => {
    const days = new Date(ovulation);
    days.setDate(ovulation.getDate() + 15);
    return (days - startDate) / MILLISECONDS_IN_A_DAY;
};

/**
 * Get the range of ovulation dates.
 *
 * @param {Date} ovulation - the day the user experienced ovulation
 * @param {Date} dayLast - the last day of menstraution
 * @returns {String[]} - an array containing the start, current, and end dates of ovulation
 */
const getOvulationRange = (ovulation, dayLast = null) => {
    const ovulationRangeStart = new Date(ovulation);
    ovulationRangeStart.setDate(ovulation.getDate() - 1);

    const ovulationRangeEnd = new Date(ovulation);
    ovulationRangeEnd.setDate(ovulation.getDate() + 1);

    const result = [
        formatDate(ovulationRangeStart),
        formatDate(ovulation),
        formatDate(ovulationRangeEnd),
    ];

    if (dayLast && ovulationRangeStart.getTime() === dayLast.getTime()) {
        result.shift(); // Remove the first element from the list.
    }

    return result;
};

/**
 * Get the range of unsafe days for conception.
 *
 * @param {Date} ovulation - the day the user experienced ovulation
 * @param {Date} lastPeriodDay - the last day of the user's menstruation
 * @returns {String[]} - an array containing unsafe days for conception
 */
const getUnsafeRange = (ovulation, lastPeriodDay) => {
    // Get unsafeRangeStart, and if the difference between unsafeRangeStart and lastPeriodDay is less than 0.
    // increase the unsafeRangeStart date
    let unsafeRangeStart;
    let i = 5;
    do {
        unsafeRangeStart = new Date(ovulation);
        unsafeRangeStart.setDate(unsafeRangeStart.getDate() - i);
        i--;
    } while (differenceInDays(unsafeRangeStart, lastPeriodDay) <= 0 && i >= 0);

    const unsafeRangeEnd = new Date(ovulation);
    unsafeRangeEnd.setDate(ovulation.getDate() + 5);

    const unsafeDays = [];
    // Append all the unsafeDays
    while (unsafeRangeStart <= unsafeRangeEnd) {
        unsafeDays.push(formatDate(unsafeRangeStart));
        unsafeRangeStart.setDate(unsafeRangeStart.getDate() + 1);
    }

    return unsafeDays;
};

/**
 * Calculate the difference in days between two dates.
 *
 * @param {Date} date1 - the first date
 * @param {Date} date2 - the second date
 * @returns {Number} - the difference in days
 */
const differenceInDays = (date1, date2) => (date1 - date2) / MILLISECONDS_IN_A_DAY;

/**
 * Format a date as a string in "YYYY-MM-DD" format.
 *
 * @param {Date} date - the date to format
 * @returns {String} - the formatted date string
 */
const formatDate = (date) => date.toISOString().split('T')[0];

/**
 * Extract the month from the datetime.
 *
 * @param {String} startdate
 * @returns {String} - the month
 */
export function month(startdate) {
    const dateObject = new Date(startdate);
    const month = dateObject.toLocaleString('en-US', { month: 'long' });

    return month;
};
