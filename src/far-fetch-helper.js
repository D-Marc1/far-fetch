/** FarFetch helper class. */
export default class FarFetchHelper {
  /**
   * Checks if value is a plain object.
   *
   * @private
   * @param {*} value - The value to check.
   * @returns {boolean} Whether or not value is a plain object.
   */
  static isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }
}
