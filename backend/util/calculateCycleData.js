class CycleCalculator {
  constructor(period, startDate, ovulation = null) {
    this.period = period;
    this.startDate = new Date(startDate);
    this.ovulation = ovulation ? new Date(ovulation) : null;
  }

  calculateCycleData() {
    const totalCycleDays = this.period;
    const periodRange = this.calculateDateRange(this.startDate, this.period);

    const formattedOvulation = this.ovulation ? this.formatDate(this.ovulation) : null;
    const ovulationRange = this.ovulation ? this.calculateDateRange(this.ovulation, 7) : [];
    const unsafeDays = this.ovulation ? this.calculateDateRange(this.ovulation, 5, false) : [];

    const nextDateObj = new Date(this.startDate);
    nextDateObj.setDate(this.startDate.getDate() + this.period);
    const nextDate = this.formatDate(nextDateObj);

    return {
      days: totalCycleDays,
      periodRange,
      ovulation: formattedOvulation,
      ovulationRange,
      unsafeDays,
      nextDate
    };
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  calculateDateRange(startDate, days, forward = true) {
    const dateRange = [];
    const direction = forward ? 1 : -1;
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (i * direction));
      dateRange.push(this.formatDate(currentDate));
    }
    return dateRange;
  }
}
export default CycleCalculator;
