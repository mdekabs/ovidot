// VALIDATE DATES

// Create an immutable object of the day
const DATE_OPTIONS = Object.freeze({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
});

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

/**
 * Check if the date is valid.
 * @param {String} date - The user inputed data.
 * @returns Boolean value
 */
const isValidDate = date => !isNaN(new Date(date));

/**
 * Validate if the user sends an appropriate date to start the cycle.
 * @param {String} startDate - date (YYYY-MM-DD)
 * @returns {boolean} - true if the date is valid, false otherwise
 */
export function validateCreateDate(startDate) {
    if (!isValidDate(startDate)) {
        return false;
    }

    const currentDate = new Date();
    const userDate = new Date(startDate);

    // Set both dates to midnight for accurate date comparison
    userDate.setHours(DATE_OPTIONS.hours, DATE_OPTIONS.minutes, DATE_OPTIONS.seconds, DATE_OPTIONS.milliseconds);
    currentDate.setHours(DATE_OPTIONS.hours, DATE_OPTIONS.minutes, DATE_OPTIONS.seconds, DATE_OPTIONS.milliseconds);

    const differenceInDays = (currentDate - userDate) / MILLISECONDS_IN_A_DAY;

    return differenceInDays <= 21 && differenceInDays >= 0;
}

/**
 * Validate if the user sends an appropriate ovulation date. Valid date falls between
 * the end of the period and less than 18 days from the period start date.
 * @param {String} prevDate - initial start date of the cycle to update.
 * @param {String} newDate - new ovulation date to update (YYYY-MM-DD)
 * @param {Number} period - the duration of menstraution
 * @returns {boolean} - true if the date is valid, false otherwise
 */
export function validateUpdateDate(prevDate, newDate, period) {
    if (!isValidDate(prevDate) || !isValidDate(newDate) || !period) {
        return false;
    }

    const newDateObj = new Date(newDate);
    const prevDateObj = new Date(prevDate);

    // Set both dates to midnight for accurate date comparison
    newDateObj.setHours(DATE_OPTIONS.hours, DATE_OPTIONS.minutes, DATE_OPTIONS.seconds, DATE_OPTIONS.milliseconds);
    prevDateObj.setHours(DATE_OPTIONS.hours, DATE_OPTIONS.minutes, DATE_OPTIONS.seconds, DATE_OPTIONS.milliseconds);

    const differenceInDays = (newDateObj - prevDateObj) / MILLISECONDS_IN_A_DAY;

    // Validate the ovulation date. Assume ovulation occur after menstraution and
    // doesn't exceed 18 days from the previous start date.
    return differenceInDays > period && differenceInDays <= 18;
}
