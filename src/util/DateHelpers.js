import _ from 'lodash';
import { DateTime } from 'luxon';

import NumberHelpers from './NumberHelpers.js';

const STANDARD_DATE_FORMAT = 'MM/dd/yyyy';

/** format for viewing in app */
export const STANDARD_DATE_TIME_FORMAT = 'MMM dd yyyy h:mm:ss a';

/** writing to db */
export const SQL_DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const effectiveStartOfWeekIdx = (datetime) =>
  datetime.weekday === 7 ? 0 : datetime.weekday;

/**
 * Always returns a Luxon DateTime object.
 */
const DateHelpers = {
  getCurrentDatetime() {
    return DateTime.local();
  },

  getCurrentISODate() {
    return DateTime.local().toISODate();
  },

  dateTimeToSQLFormat(datetimeObj) {
    return datetimeObj.set({ hour: 12, minute: 0 }).toFormat(SQL_DATE_TIME_FORMAT);
  },

  getStartOfWeekForDay(givenDay) {
    const dateToUse = givenDay
      ? DateHelpers.convertToDateTime(givenDay)
      : DateHelpers.getCurrentDatetime();

    return dateToUse.minus({ days: givenDay.weekday === 7 ? 0 : givenDay.weekday }).startOf('day');
  },

  getStartOfMonthForDay(givenDay) {
    const dateToUse = givenDay
      ? DateHelpers.convertToDateTime(givenDay)
      : DateHelpers.getCurrentDatetime();

    return dateToUse.startOf('month').startOf('day');
  },

  convertToDateTime(date, { fallbackFormat } = {}) {
    if (date instanceof DateTime) {
      return date;
    }
    if (DateHelpers.isJSDate(date)) {
      return DateTime.fromJSDate(date);
    }
    if (_.isInteger(date)) {
      return DateTime.fromMillis(date);
    }
    if (fallbackFormat) {
      return DateTime.fromFormat(date, fallbackFormat);
    }

    return DateTime.fromISO(date);
  },

  isJSDate(potentialDate) {
    // https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
    return potentialDate instanceof Date && !_.isNaN(potentialDate.valueOf());
  },

  standardFormat(date, dateFormat = STANDARD_DATE_FORMAT) {
    const d = DateHelpers.convertToDateTime(date);
    return d.toFormat(dateFormat);
  },

  standardDateTimeFormat(date) {
    return DateHelpers.standardFormat(date, STANDARD_DATE_TIME_FORMAT);
  },

  getDifference(date, returnFormat = 'days', round = 1) {
    const d = DateHelpers.convertToDateTime(date);
    const diff = d.diffNow(returnFormat);

    return NumberHelpers.round10(Math.abs(diff[returnFormat]), round);
  },

  getDifferenceBetween(date1, date2, returnFormat = 'days', round = 1) {
    const d1 = DateHelpers.convertToDateTime(date1);
    const d2 = DateHelpers.convertToDateTime(date2);
    const diff = d1.diff(d2, returnFormat);

    return NumberHelpers.round10(Math.abs(diff[returnFormat]), round);
  },

  toUTCString(date) {
    return DateHelpers.convertToDateTime(date).toUTC().toISO();
  },

  /**
   * Converts Date objects to ISO date strings.
   *
   * @param {Date} date
   *
   * @returns {String} An ISO date string.
   */
  toISODateString(date) {
    if (!(date instanceof Date)) throw new Error('Must pass a JavaScript `Date` object.');

    return DateTime.fromISO(date.toISOString()).toISODate();
  },

  toLocalISODateString(utcDate) {
    return DateTime.fromISO(utcDate, { zone: 'UTC' }).toLocal().toISODate();
  },

  datetimeSort(dateA, dateB, { reverse = false } = {}) {
    const datetimeA = DateHelpers.convertToDateTime(dateA);
    const datetimeB = DateHelpers.convertToDateTime(dateB);

    return reverse
      ? datetimeB.diff(datetimeA).toObject().milliseconds
      : datetimeA.diff(datetimeB).toObject().milliseconds;
  },
};

export default DateHelpers;
