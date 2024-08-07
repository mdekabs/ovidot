export const isDateInCurrentMonth = (date) => {
    try {
        const dateObj = new Date(date);
        const now = new Date();

        if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
        }

        const isSameYear = dateObj.getFullYear() === now.getFullYear();
        const isSameMonth = dateObj.getMonth() === now.getMonth();
        const isNotFutureDate = dateObj <= now;

        return isSameYear && isSameMonth && isNotFutureDate;
    } catch (error) {
        console.error('Error in isDateInCurrentMonth:', error);
        return false;
    }
};
