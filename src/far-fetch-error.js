import FarFetchHelper from './far-fetch-helper';

/** FarFetch Error class.
 * @extends Error
 */
export default class FarFetchError extends Error {
  /**
   * @param {string|Object.<string, *>} message - Will be in the `message` property if a string
   * or its own properties if object.
   */
  constructor(message) {
    let messageString;

    if (typeof message === 'string') {
      messageString = message;
    }

    super(messageString);

    this.name = this.constructor.name;

    // Create object properties if message is an object
    if (FarFetchHelper.isPlainObject(message)) {
      Object.keys(message).forEach((key) => {
        this[key] = message[key];
      });
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(messageString)).stack;
    }
  }
}
