export const isDateInCurrentMonth = (date) => {
    const dateObj = new Date(date);
    const now = new Date();

    const isSameYear = dateObj.getFullYear() === now.getFullYear();
    const isSameMonth = dateObj.getMonth() === now.getMonth();

    return isSameYear && isSameMonth;
};
