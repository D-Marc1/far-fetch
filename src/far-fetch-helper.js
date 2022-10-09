/** FarFetch helper class. */
export default class FarFetchHelper {
  /**
   * Checks if value is a plain object.
   *
   * @param {*} value - The value to check.
   * @returns {boolean} Whether or not value is a plain object.
   */
  static isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  static isEmptyObject(value) {
    return this.isPlainObject(value) && Object.keys(value).length === 0;
  }

  static isValidReturnType(type) {
    return type === 'arrayBuffer' || 'blob' || 'formData' || 'json' || 'text' || 'none';
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


  /**
   * Creates FormData for file uploads.
   *
   * @param {Object} options
   * @param {File|File[]|Object.<string, File>|Object.<string, File[]>} options.files - Files to
   * upload to server. Will use `file` as key if literal and `files[]` if array;
   * if object, will use properties as keys.
   * @param {Object.<string, string|number|null|boolean|Array|Object>} [options.data = {}] - Data
   * sent to server on request. Will use `body` for: POST, PUT, PATCH and `URL query params string`
   * for: GET, HEAD, DELETE.
   * @returns {FormData}
   */
  static createFormData({ files, data }) {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]); // Add parameters to formData
    });

    if (files instanceof File) { // Single, unnamed file
      const file = files; // Set to be more readable and consistent, as it's singular

      formData.append('file', file);
    } else if (Array.isArray(files)) { // NOT specifying a name if array
      files.forEach((file) => {
        formData.append('files[]', file); // Server-side page will have a file array
      });
    } else if (FarFetchHelper.isPlainObject(files)) { // IS specifying a name if object
      Object.keys(files).forEach((key) => {
        const propFiles = files[key]; // Each object property representing distinct file category

        if (propFiles instanceof File) { // Single, unnamed file
          const propFile = propFiles; // Set to be more readable and consistent, as it's singular

          formData.append(key, propFile);
        } else if (Array.isArray(propFiles)) { // Array of files for object property
          propFiles.forEach((propFile) => {
            formData.append(`${key}[]`, propFile);
          });
        }
      });
    }

    return formData;
  }

  /**
   * Convert an object to a query string, even if the value is an object or array.
   *
   * @param {Object} object - Object to convert to query string.
   * @returns {string} Query string or empty string, if object is empty
   */
  static objectToQueryString(object) {
    if (Object.keys(object).length > 0) {
      const dataStringified = Object.entries(object).map(([key, value]) => {
        const valueStringified = typeof value === 'object' ? JSON.stringify(value) : value;

        return [key, valueStringified];
      });

      return `?${new URLSearchParams(dataStringified)}`;
    }

    return '';
  }
}
