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

  /**
   * Checks if string is an absolute URL.
   * Credit: https://github.com/sindresorhus/is-absolute-url
   *
   * @param {string} url - URL string.
   * @return {boolean} Whether or not string is an absolute URL.
   */
  static isAbsoluteURL(url) {
    if (typeof url !== 'string') {
      throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``);
    }

    // Don't match Windows paths `c:\`
    if (/^[a-zA-Z]:\\/.test(url)) {
      return false;
    }

    // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
    // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
  }
}
