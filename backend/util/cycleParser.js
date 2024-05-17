class CycleParser {
  constructor(cycleData) {
    this.cycleData = cycleData;
  }

  parseCycle() {
    const { days, periodRange, ovulation, ovulationRange, unsafeDays, nextDate } = this.cycleData;

    // Convert period range dates to a formatted string
    const formattedPeriodRange = periodRange.map(date => this.formatDate(date));

    // Convert ovulation range dates to a formatted string
    const formattedOvulationRange = ovulationRange.map(date => this.formatDate(date));

    // Convert unsafe days dates to a formatted string
    const formattedUnsafeDays = unsafeDays.map(date => this.formatDate(date));

    // Format next date
    const formattedNextDate = this.formatDate(nextDate);

    return {
      days,
      periodRange: formattedPeriodRange,
      ovulation: this.formatDate(ovulation),
      ovulationRange: formattedOvulationRange,
      unsafeDays: formattedUnsafeDays,
      nextDate: formattedNextDate
    };
  }

  formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  }
}
