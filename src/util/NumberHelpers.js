import _ from 'lodash';

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
// eslint-disable-next-line no-extend-native
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number}      The adjusted value.
 */
const decimalAdjust = (type, value, exp) => {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (_.isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math[type](+`${value[0]}e${value[1] ? +value[1] - exp : -exp}`);
  // Shift back
  value = value.toString().split('e');
  return +`${value[0]}e${value[1] ? +value[1] + exp : exp}`;
};

/* samples

// Round
NumberHelpers.round10(55.55, -1); // 55.6
NumberHelpers.round10(55.549, -1); // 55.5
NumberHelpers.round10(55, 1); // 60
NumberHelpers.round10(54.9, 1); // 50
NumberHelpers.round10(-55.55, -1); // -55.5
NumberHelpers.round10(-55.551, -1); // -55.6
NumberHelpers.round10(-55, 1); // -50
NumberHelpers.round10(-55.1, 1); // -60
NumberHelpers.round10(1.005, -2); // 1.01 -- compare this with NumberHelpers.round(1.005*100)/100 above
// Floor
NumberHelpers.floor10(55.59, -1); // 55.5
NumberHelpers.floor10(59, 1); // 50
NumberHelpers.floor10(-55.51, -1); // -55.6
NumberHelpers.floor10(-51, 1); // -60
// Ceil
NumberHelpers.ceil10(55.51, -1); // 55.6
NumberHelpers.ceil10(51, 1); // 60
NumberHelpers.ceil10(-55.59, -1); // -55.5
NumberHelpers.ceil10(-59, 1); // -50
*/

const NumberHelpers = {
  stringToInteger(str, failedValue = NaN) {
    if (typeof str !== 'string') return failedValue;
    const val = parseInt(str, 10);
    return Number.isNaN(val) ? failedValue : val;
  },
  stringToFloat(str, failedValue = NaN) {
    if (typeof str !== 'string') return failedValue;
    const val = parseFloat(str);
    return Number.isNaN(val) ? failedValue : val;
  },
  isNumericString(str) {
    if (typeof str !== 'string') return false;
    return !Number.isNaN(str) && !Number.isNaN(parseFloat(str));
  },
  asNumeric(str) {
    return NumberHelpers.isNumericString(str) ? parseFloat(str) : str;
  },
  round10(value, exp) {
    return decimalAdjust('round', value, exp);
  },
  floor10(value, exp) {
    return decimalAdjust('floor', value, exp);
  },
  ceil10(value, exp) {
    return decimalAdjust('ceil', value, exp);
  },

  // ADDING "Round half away from zero" style positive/negative rounding
  // Also called symmetric arithmetic rounding
  // See the wikipedia page here: http://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
  sround10(value, exp) {
    // could probably doing this faster
    const val = NumberHelpers.round10(Math.abs(value), exp);
    return value >= 0 ? val : -val;
  },

  /**
   * @param {Number[]} numbers - A sorted or semi-sorted array of numbers. Consecutive numbers
   * differing by 1 get condensed into a string.
   *
   * @returns {String[]} The condensed range strings, eg ['1-3', '5-7', '9'].
   */
  getCondensedRangeStrs(numbers) {
    const rangeStrs = [];

    let rangeStart;
    let rangeEnd;
    for (let i = 0; i < numbers.length; i += 1) {
      rangeStart = numbers[i];

      while (numbers[i + 1] - numbers[i] === 1) {
        i += 1;
      }
      rangeEnd = numbers[i];

      rangeStrs.push(rangeStart === rangeEnd ? rangeStart.toString() : `${rangeStart}-${rangeEnd}`);
    }

    return rangeStrs;
  },

  roundToNearestMultiple({ number, multiple }) {
    const offset = number % multiple;

    if (offset <= multiple / 2) {
      return number - offset;
    }

    return number + multiple - offset;
  },
};

export default NumberHelpers;
