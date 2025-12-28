// modules/objectUtils.mjs
// Shared object utility functions

export class ObjectUtils {
    /**
     * Flattens a nested object into a single-level object with dot-separated keys.
     * @param {Object} obj - The object to flatten.
     * @param {string} parentKey - The prefix for the keys (used for recursion).
     * @param {string} separator - The separator between keys.
     * @returns {Object} The flattened object.
     */
    static flattenObject(obj, parentKey = '', separator = '.') {
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    Object.assign(result, ObjectUtils.flattenObject(value, newKey, separator));
                } else {
                    result[newKey] = value;
                }
            }
        }
        return result;
    }
}
