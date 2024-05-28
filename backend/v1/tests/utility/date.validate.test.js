import { validateCreateDate, validateUpdateDate } from "../../utility/date.validate.js";
import sinon from 'sinon';
import { expect } from 'chai';

describe('Test validateCreateDate function', () => {
  let clock;

  before(() => {
    // Freeze time to '2023-11-23'
    clock = sinon.useFakeTimers(new Date('2023-11-23').getTime());
  });

  after(() => {
    // Restore the original Date object
    clock.restore();
  });

  it('returns false for an invalid date', () => {
    const invalidDate = 'invalid-date';
    expect(validateCreateDate(invalidDate)).to.be.false;
  });

  it('returns true for a valid date within the 21-day range', () => {
    const validDate = '2023-11-22';
    expect(validateCreateDate(validDate)).to.be.true;
  });

  it('returns false for a valid date outside the 21-day range', () => {
    const invalidDate = '2023-11-01';
    expect(validateCreateDate(invalidDate)).to.be.false;
  });
});


describe('Test validateUpdateDate function', () => {
  it('returns false for invalid inputs', () => {
    expect(validateUpdateDate(null, '2023-11-23', 7)).to.be.false;
    expect(validateUpdateDate('2023-11-23', null, 7)).to.be.false;
    expect(validateUpdateDate('2023-11-23', '2023-11-24', null)).to.be.false;
  });

  it('returns false for new date within period days', () => {
    const prevDate = '2023-11-20';
    const newDate = '2023-11-23';
    const period = 5;

    expect(validateUpdateDate(prevDate, newDate, period)).to.be.false;
  });

  it('returns true for valid new date outside period days but within 18 days', () => {
    const prevDate = '2023-11-05';
    const newDate = '2023-11-20';
    const period = 7;

    expect(validateUpdateDate(prevDate, newDate, period)).to.be.true;
  });

  it('returns false for new date exceeding 18 days from the previous start date', () => {
    const prevDate = '2023-11-05';
    const newDate = '2023-12-01';
    const period = 7;

    expect(validateUpdateDate(prevDate, newDate, period)).to.be.false;
  });
});
