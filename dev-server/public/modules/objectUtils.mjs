// Timer management utilities for prune/cleanup intervals
export const TimerUtils = {
  /**
   * Starts an interval timer for a given callback and interval.
   * If an existing timer is running, it is cleared first.
   * @param {object} obj - The object holding the timer property.
   * @param {string} timerProp - The property name for the timer (e.g., '_cachePruneTimer').
   * @param {string} intervalProp - The property name for the interval ms (e.g., '_cachePruneIntervalMs').
   * @param {function} callback - The function to call on each interval.
   * @param {number} intervalMs - The interval in ms.
   */
  /**
   * Starts an interval timer for a given callback and interval.
   * If an existing timer is running, it is cleared first.
   * Robust against invalid input and prevents memory leaks.
   */
  start(obj, timerProp, intervalProp, callback, intervalMs) {
    if (
      !obj ||
      typeof callback !== "function" ||
      typeof intervalMs !== "number" ||
      intervalMs <= 0
    ) {
      throw new Error("TimerUtils.start: Invalid arguments");
    }
    if (obj[timerProp]) {
      clearInterval(obj[timerProp]);
    }
    obj[intervalProp] = intervalMs;
    obj[timerProp] = setInterval(callback, intervalMs);
  },

  /**
   * Pauses (clears) the interval timer.
   */
  /**
   * Pauses (clears) the interval timer. Safe to call multiple times.
   */
  pause(obj, timerProp) {
    if (!obj) return;
    if (obj[timerProp]) {
      clearInterval(obj[timerProp]);
      obj[timerProp] = null;
    }
  },

  /**
   * Resumes the interval timer if interval ms is set.
   */
  /**
   * Resumes the interval timer if interval ms is set and timer is not running.
   */
  resume(obj, timerProp, intervalProp, callback) {
    if (!obj || typeof callback !== "function") return;
    if (
      !obj[timerProp] &&
      typeof obj[intervalProp] === "number" &&
      obj[intervalProp] > 0
    ) {
      obj[timerProp] = setInterval(callback, obj[intervalProp]);
    }
  },

  /**
   * Stops the interval timer and clears the interval ms.
   */
  /**
   * Stops the interval timer and clears interval ms. Safe to call multiple times.
   */
  stop(obj, timerProp, intervalProp) {
    if (!obj) return;
    if (obj[timerProp]) {
      clearInterval(obj[timerProp]);
      obj[timerProp] = null;
    }
    obj[intervalProp] = null;
  },
};
// modules/objectUtils.mjs
// Shared object utility functions

/**
 * Creates a standard storage config object for modules.
 * @param {Object} options - TTLs and any overrides.
 * @param {number} options.cacheTtlMs
 * @param {number} options.sessionTtlMs
 * @param {number} options.localTtlMs
 * @param {string|null} [options.googleId]
 * @param {string|null} [options.githubFilename]
 * @param {string|null} [options.privateKey]
 * @param {string|null} [options.publicKey]
 * @param {boolean} [options.secure]
 * @returns {Object}
 */
export function createStorageConfig({
  cacheTtlMs,
  sessionTtlMs,
  localTtlMs,
  googleId = null,
  githubFilename = null,
  privateKey = null,
  publicKey = null,
  secure = false,
}) {
  return {
    cacheTtlMs,
    sessionTtlMs,
    localTtlMs,
    googleId,
    githubFilename,
    privateKey,
    publicKey,
    secure,
  };
}

export class ObjectUtils {
  /**
   * Flattens a nested object into a single-level object with dot-separated keys.
   * @param {object} obj - The object to flatten.
   * @param {string} [parentKey] - The prefix for the keys (used for recursion).
   * @param {string} [separator='.'] - The separator between keys.
   * @returns {object} The flattened object.
   */
  static flattenObject(obj, parentKey = "", separator = ".") {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
        const value = obj[key];
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          Object.assign(
            result,
            ObjectUtils.flattenObject(value, newKey, separator),
          );
        } else {
          result[newKey] = value;
        }
      }
    }
    return result;
  }

  /**
   * Filters an array of objects by a property and value.
   * @param {Array<object>} array - The array to filter.
   * @param {string} property - The property name to match.
   * @param {*} value - The value to match.
   * @returns {Array<object>} Filtered array of objects.
   */
  static filterByProperty(array, property, value) {
    return Array.isArray(array)
      ? array.filter((item) => item && item[property] === value)
      : [];
  }

  /**
   * Alias for filterByProperty. Filters an array of objects by a property and value.
   * @param {Array<object>} array - The array to filter.
   * @param {string} property - The property name to match.
   * @param {*} value - The value to match.
   * @returns {Array<object>} Filtered array of objects.
   */
  static filterBy(array, property, value) {
    return ObjectUtils.filterByProperty(array, property, value);
  }

  /**
   * Checks if an array has any elements.
   * @param {Array} array - The array to check.
   * @returns {boolean} True if array has elements, false otherwise.
   */
  static hasAny(array) {
    return Array.isArray(array) && array.length > 0;
  }
}
