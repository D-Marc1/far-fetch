import FarFetchHelper from './far-fetch-helper';
import FarFetchError from './far-fetch-error';

export { FarFetchError };

/**
 * The Request exception object.
 *
 * @typedef {object} RequestException
 * @property {FarFetchError} error - FarFetch error.
 * @property {ResponsePlus} response - Fetch API response plus added properties for syntactic sugar.
 */

/**
 * Request object plus responseJSON and responseText properties if correct header type.
 *
 * @typedef {object} ResponsePlus
 * @property {Response} response - Fetch API response
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|Response object}.
 * @property {object} [response.responseJSON = null] - FarFetch added property that transforms the
 * body to
 * JSON for syntactic sugar if the same response header type.
 * @property {string} [response.responseText = null] - FarFetch added property that transforms the
 * body to text for syntactic sugar if the same response header type.
 */

/**
 * The request object options.
 *
 * @typedef {object} RequestOptions
 * @property {object.<string, string|number|null|boolean>} [data = {}] - Data sent to server on
 * request.
 * @property {File|File[]|object.<string, File>|object.<string, File[]>} [files] - Files to upload
 * to server.
 * Will use `file` as key if literal and `files[]` if array; if object, will use properties as keys.
 * @property {string} [errorMsgNoun = ''] - Appended error message noun to global error handler.
 * @property {string} [errorMsg = ''] - Error message used to global error handler. Overrides
 * `errorMsgNoun`
 * @property {boolean} [globalBeforeSend = true] - Will this specific request use the beforeSend()
 * hook?
 * @property {boolean} [globalAfterSend = true] - Will this specific request use the afterSend()
 * hook?
 * @property {boolean} [defaultOptionsUsed = true] - Will this specific request use the default
 * options specified on instantiation or with `setDefaultOptions()`?
 * @property {...object} [rest = {}] -
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|Init options}
 * from Fetch API.
 */

/**
 * Callback for global error handler.
 *
 * @callback errorHandlerCallback
 * @param {object} [options]
 * @param {FarFetchError|Error} [options.error] - The FarFetchError option. Will throw regular error
 * if needed.
 * @param {ResponsePlus} [options.response] - Request object plus responseJSON and responseText
 * properties if correct header type.
 * @param {string} [options.userMessage] - The message given to the user.
 */

/**
 * Callback for global after send hook.
 *
 * @callback afterSendCallback
 * @param {ResponsePlus} response - Request object plus responseJSON and responseText properties if
 * correct header type.
 */

/**
 * Callback for overriding default error message template.
 *
 * @callback errorMsgTemplateCallback
 * @param {object} [options]
 * @param {('GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD')} [options.method] - The CRUD method.
 * @param {string} [options.errorMsgNoun] - The error message noun.
 * @returns {string} Full error message string.
 */

/** CRUD class to simplify fetch API and uploading. */
export default class FarFetch {
  /**
   * Create FarFetch object.
   *
   * @param {object} [options = {}] - Set options.
   * @param {string} [options.baseURL = ''] - Base URL for each request.
   * @param {Function} [options.beforeSend] - Function to do something before each fetch request.
   * @param {afterSendCallback} [options.afterSend] - Function to do something after each fetch
   * request.
   * @param {errorHandlerCallback} [options.errorHandler] - Global error handler.
   * @param {errorMsgTemplateCallback} [options.errorMsgTemplate] - Function to modify the default
   * error message template for `errorMsgNoun`.
   * @param {...RequestOptions} [options.RequestOptions]
   *
   * @example
   * const ff = new FarFetch({
   *   beforeSend() {
   *     console.log('Doing something before every request');
   *   },
   *   afterSend(response) {
   *     console.log('Doing after before every request');
   *   },
   *   errorHandler({ error, userMessage, response }) {
   *     if(response.status === 401) { // Unauthorized
   *       router.push('/login');
   *     }
   *
   *     alert(userMessage); // Error message from either errorMsg or errorMsgNoun will be used
   *   },
   *   headers: { 'Content-Type': 'application/json' },
   * });
   */
  constructor({
    baseURL = '',
    beforeSend,
    afterSend,
    errorHandler,
    errorMsgTemplate,
    ...defaultOptions
  } = {}) {
    this.baseURL = baseURL;
    this.beforeSend = beforeSend;
    this.afterSend = afterSend;
    this.errorHandler = errorHandler;
    this.errorMsgTemplate = errorMsgTemplate;
    this.defaultOptions = defaultOptions;
  }

  /**
   * Set default options.
   *
   * @param {...RequestOptions} [options]
   */
  setDefaultOptions(options) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Creates FormData for file uploads.
   *
   * @private
   * @param {object} [data = {}]
   * @param {File|File[]|object.<string, File>|object.<string, File[]>} data.files - Files to
   * upload to server. Will use `file` as key if literal and `files[]` if array;
   * if object, will use properties as keys.
   * @param {object.<string, string|number|null|boolean>} [data.data = {}] - Data sent to server.
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
   * The default error message.
   *
   * @private
   * @param {('GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD')} method - The CRUD method.
   * @param {string} errorMsgNoun - The error message noun.
   * @returns {string} Full error message string.
   */
  userMessage({ method, errorMsg, errorMsgNoun }) {
    // Custom error message used for single request
    if (errorMsg) return errorMsg;

    // Error template is modified
    if (typeof this.errorMsgTemplate === 'function') {
      const errorMsgTemplate = this.errorMsgTemplate({ method, errorMsgNoun });

      return errorMsgTemplate;
    }

    let action = '';

    if (method === 'GET' || method === 'HEAD') {
      action = 'fetching';
    } else if (method === 'POST') {
      action = 'adding';
    } else if (method === 'PUT' || method === 'PATCH') {
      action = 'updating';
    } else if (method === 'DELETE') {
      action = 'deleting';
    }

    return `Error ${action} ${errorMsgNoun}`;
  }

  /**
   * Set options to confrom to FarFetch
   *
   * @private
   * @param {object} options
   * @param {object.<string, string|number|null|boolean>} [options.data = {}] - Data sent to server
   * on request.
   * @param {boolean} [defaultOptionsUsed = true] - Will this specific request use the default
   * options specified on instantiation or with `setDefaultOptions()`?
   * @param {File|File[]|object.<string, File>|object.<string, File[]>} [files] - Files to upload to
   * server.
   * @param {...object} [rest = {}] -
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|Init options}
   * from Fetch API.
   */
  setFetchOptions({
    data = {},
    defaultOptionsUsed,
    files,
    ...rest
  }) {
    let options = {};

    let queryString = '';

    const contentTypeHeader = options.headers?.['Content-Type'];

    const isFormURLEncoded = contentTypeHeader?.includes('application/x-www-form-urlencoded');

    if (defaultOptionsUsed) {
      options = { ...this.defaultOptions, ...rest };
    } else {
      options = rest;
    }

    if (files) { // Files property used, so must be upload
      const formData = FarFetch.createFormData({ files, data });

      options.body = formData;

      // File upload shouldn't have a content supplied; it will auto-detect
      delete options.headers?.['Content-Type'];
    // Data object has at least one property
    } else if (Object.keys(data).length > 0) {
      // Can't be used in body
      if (options.method === 'GET' || options.method === 'DELETE' || options.method === 'HEAD') {
        queryString = `?${new URLSearchParams(Object.entries(data))}`;
      } else if (isFormURLEncoded) { // FormURLEncoded requires URL params in body
        options.body = new URLSearchParams(Object.entries(data));
      } else if (options.method === 'POST' || options.method === 'PUT'
        || options.method === 'PATCH') {
        // JSON content-type header is necessary to match JSON body
        options = { ...options, headers: { 'Content-Type': 'application/json' } };

        options.body = JSON.stringify(data);
      }
    }

    return { queryString, options };
  }

  /**
   * @private
   * @param {Response} response - Fetch API response object.
   * @returns {Response} - Modified response object with responseJSON and responseText properties as
   * transformed body for syntactic sugar.
   */
  static async modifiedResponse(response) {
    const responseContentType = response.headers?.get('Content-Type');

    const responseContentTypeJson = responseContentType?.includes('application/json');
    const responseContentTypeText = responseContentType?.includes('text/plain');

    /* Transforming body, like calling json(), can only be used once, so clone is needed to keep
    original. Also needed to clone parameter to prevent mutating it. */
    const modifiedResponse = response.clone();

    modifiedResponse.responseJSON = null;
    modifiedResponse.responseText = null;

    if (responseContentTypeJson) {
      modifiedResponse.responseJSON = await response.json();
    } else if (responseContentTypeText) {
      modifiedResponse.responseText = await response.text();
    }

    return modifiedResponse;
  }

  /**
   * Request function called on every CRUD function.
   *
   * @param {string} url - The URL.
   * @param {object} options
   * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD'} options.method - The CRUD method.
   * @param {...RequestOptions} [options.RequestOptions]
   * @returns {Promise<ResponsePlus>}
   * @throws {RequestException}
   *
   * @example
   * await ff.fetch('https://my-website.com/users', {
   *  method: 'GET',
   *  data: { id: 23 },
   *  errorMsgNoun: 'users',
   * });
   */
  async fetch(url, {
    data = {},
    files,
    errorMsg = '',
    errorMsgNoun = '',
    globalBeforeSend = true,
    globalAfterSend = true,
    defaultOptionsUsed = true,
    ...rest
  }) {
    // If globalBeforeSend option is set to true and beforeSend() declared on instantiation
    if (globalBeforeSend && typeof this.beforeSend === 'function') {
      this.beforeSend(); // Do something before every request
    }

    const { queryString, options } = this.setFetchOptions({
      data,
      defaultOptionsUsed,
      files,
      ...rest,
    });

    let response = '';

    try {
      let fullURL = `${url}${queryString}`;

      // Base URL is given and URL on request is a relative path
      if (this.baseURL && !FarFetchHelper.isAbsoluteURL(url)) {
        fullURL = `${this.baseURL}${fullURL}`;
      }

      response = await fetch(fullURL, options);

      if (!response.ok) throw new FarFetchError('Server error.');
    } catch (error) {
      if (error instanceof FarFetchError) {
        // Global error handler needs to be declared and either
        // an entire errorMsg or just the appended errorMsgNoun need to be declared
        if (typeof this.errorHandler === 'function' && (errorMsg || errorMsgNoun)) {
          response = await FarFetch.modifiedResponse(response);

          const userMessage = this.userMessage({
            errorMsg,
            errorMsgNoun,
            method: options.method,
          });

          this.errorHandler({ error, response, userMessage });
        }

        // Throw request object to all manually handling exception and stop execution for sequential
        // tasks
        throw new FarFetchError({ error, response });
      } else {
        throw error;
      }
    }

    response = await FarFetch.modifiedResponse(response);

    // If globalAfterSend option is set to true and beforeSend() declared on instantiation
    if (globalAfterSend && typeof this.afterSend === 'function') {
      this.afterSend(response);
    }

    return response;
  }

  /**
   * GET fetch request.
   *
   * @param {string} url - The URL.
   * @param {...RequestOptions} [options]
   * @returns {Promise<ResponsePlus>}
   * @throws {RequestException}
   *
   * @example
   * await ff.get('https://my-website.com/users', {
   *  data: { id: 23 },
   *  errorMsgNoun: 'users',
   * });
   */
  async get(url, options) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  /**
   * POST fetch request. Will default to `'Content-Type': 'application/json'` for the request header
   * if `FarFetch` data option is provided.
   *
   * @param {string} url - The URL.
   * @param {...RequestOptions} [options]
   * @returns {Promise<ResponsePlus>}
   * @throws {RequestException}
   *
   * @example
   * await ff.post('https://my-website.com/user/23', {
   *  data: { gender: 'male', age: 39 },
   *  errorMsgNoun: 'user',
   * });
   */
  async post(url, options) {
    return this.fetch(url, { ...options, method: 'POST' });
  }

  /**
   * PUT fetch request. Will default to `'Content-Type': 'application/json'` for the request header
   * if `FarFetch` data option is provided.
   *
   * @param {string} url - The URL.
   * @param {...RequestOptions} [options]
   * @returns {Promise<ResponsePlus>}
   * @throws {RequestException}
   *
   * @example
   * await ff.put('https://my-website.com/user/47', {
   *  data: { gender: 'female', age: 22 },
   *  errorMsgNoun: 'user',
   * });
   */
  async put(url, options) {
    return this.fetch(url, { ...options, method: 'PUT' });
  }

  /**
   * PATCH fetch request. Will default to `'Content-Type': 'application/json'` for the request
   * header if `FarFetch` data option is provided.
   *
   * @param {string} url - The URL.
   * @param {...RequestOptions} [options]
   * @returns {Promise<ResponsePlus>}
   * @throws {RequestException}
   *
   * @example
   * await ff.patch('https://my-website.com/user/91', {
   *  data: { age: 18 },
   *  errorMsgNoun: 'user',
   * });
   */
  async patch(url, options) {
    return this.fetch(url, { ...options, method: 'PATCH' });
  }

  /**
   * DELETE fetch request.
   *
   * @param {string} url - The URL.
   * @param {...RequestOptions} [options]
   * @returns {Promise<ResponsePlus>}
   * @throws {RequestException}
   *
   * @example
   * await ff.delete('https://my-website.com/user/107', {
   *  errorMsgNoun: 'user',
   * });
   */
  async delete(url, options) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  /**
   * HEAD fetch request.
   *
   * @param {string} url - The URL.
   * @param {...RequestOptions} [options]
   * @returns {Promise<ResponsePlus>}
   * @throws {RequestException}
   *
   * @example
   * await ff.head('https://my-website.com/user/107');
   */
  async head(url, options) {
    return this.fetch(url, { ...options, method: 'HEAD' });
  }
}
