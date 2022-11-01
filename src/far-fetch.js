import deepMerge from 'deepmerge';

import FarFetchHelper from './far-fetch-helper';
import FarFetchError from './far-fetch-error';

export { FarFetchError };

/**
 * The Request exception object.
 *
 * @typedef {Object} RequestException
 * @property {FarFetchError} error - FarFetch error.
 * @property {ResponsePlus} response - Fetch API response plus added properties for syntactic sugar.
 */

/**
 * Request object plus responseData, which is the transformed body, according to the specified type.
 *
 * @typedef {Object} ResponsePlus
 * @property {Response} response - Fetch API response.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|Response object}.
 * @property {ArrayBuffer|Blob|FormData|JSON|string|null} [response.responseData = null] - FarFetch
 * added property that transforms the body to the specified response type for syntactic sugar.
 */

/**
 * Response types available.
 *
 * @typedef {('arrayBuffer'|'blob'|'formData'|'json'|'text'|null)} ResponseType
 */

/**
 * The request object options without Fetch API options.
 *
 * @typedef {Object} RequestOptionsNoInit
 * @property {Object.<string, string|number|null|boolean|Array|Object>} [data = {}] - Data sent to
 * server on request. Will use `body` for: POST, PUT, PATCH and `URL query params string` for: GET,
 * HEAD, DELETE.
 * @property {Object.<string, string|number|null|boolean|Array|Object>} [URLParams = {}] - URL query
 * params string. Don't use both `data` and `URLParams` together with GET, HEAD or DELETE, as
 * they're redundant in these cases. Pick one or the other, as they will both have the same effect.
 * @property {File|File[]|Object.<string, File>|Object.<string, File[]>} [files] - Files to upload
 * to server.
 * Will use `file` as key if literal and `files[]` if array; if object, will use properties as keys.
 * @property {string} [errorMsgNoun = ''] - Appended error message noun to global error handler.
 * @property {string} [errorMsg = ''] - Error message used to global error handler. Overrides
 * `errorMsgNoun`.
 * @property {boolean} [globalBeforeSend = true] - Will this specific request use the beforeSend()
 * hook?
 * @property {boolean} [globalAfterSend = true] - Will this specific request use the afterSend()
 * hook?
 * @property {boolean} [defaultOptionsUsed = true] - Will this specific request use the
 * default options specified on instantiation and the return value of `dynamicOptions()`?
 * @property {ResponseType} [responseType = this.defaultResponseType] - The response type.
 */

/**
 * The request object options.
 *
 * @typedef {Object} RequestOptions
 * @property {...RequestOptionsNoInit} [requestOptionsNoInit]
 * @property {...RequestInit} [rest] -
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|Init options}
 * from Fetch API.
 */

/**
 * Callback for global dynamic options. Allows a dynamic option to be set, like a token stored in
 * localStorage.
 *
 * @callback dynamicOptionsCallback
 * @returns {...RequestInit}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|Init options}
 * from Fetch API.
 */

/**
 * Callback for global before send hook.
 *
 * @callback beforeSendCallback
 * @param {Object} [options]
 * @param {string} [options.url] - The URL.
 * @param {RequestInit} [options.fetchAPIOptions] -
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|Init options}
 * from Fetch API.
 * @param {...RequestOptionsNoInit} [options.requestOptions] - The request object options without
 * Fetch API options.
 */

/**
 * Callback for global after send hook.
 *
 * @callback afterSendCallback
 * @param {ResponsePlus} response
 */

/**
 * Callback for global error handler.
 *
 * @callback errorHandlerCallback
 * @param {Object} [options]
 * @param {FarFetchError|Error} [options.error] - The FarFetchError option. Will throw regular error
 * if needed.
 * @param {ResponsePlus} [options.response]
 * @param {string} [options.userMessage] - The message given to the user.
 */

/**
 * Callback for overriding default error message template.
 *
 * @callback errorMsgTemplateCallback
 * @param {Object} [options]
 * @param {('GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD')} [options.method] - The CRUD method.
 * @param {string} [options.errorMsgNoun] - The error message noun.
 * @returns {string} Full error message string.
 */

/** CRUD class to simplify fetch API and uploading. */
export default class FarFetch {
  /**
   * Create FarFetch object.
   *
   * @param {Object} [options = {}] - Set options.
   * @param {string} [options.baseURL = ''] - Base URL for each request.
   * @param {dynamicOptionsCallback} [options.dynamicOptions] - Function that allows a dynamic
   * option to be set, like a token stored in localStorage.
   * @param {beforeSendCallback} [options.beforeSend] - Function to do something before
   * each fetch request. Can return object with RequestOptions to add or override options.
   * @param {afterSendCallback} [options.afterSend] - Function to do something after each fetch
   * request.
   * @param {ResponseType} [options.defaultResponseType = 'json'] - The default response type.
   * The default value is 'json'.
   * @param {errorHandlerCallback} [options.errorHandler] - Global error handler.
   * @param {errorMsgTemplateCallback} [options.errorMsgTemplate] - Function to modify the default
   * error message template for `errorMsgNoun`.
   * @param {...RequestInit} [options.defaultOptions = {}] -
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|Init options}
   * from Fetch API.
   *
   * @example
   * const ff = new FarFetch({
   *   baseURL: 'https://my-url.com',
   *   dynamicOptions() {
   *     // Use authorization header if token set in localStorage
   *     if (localStorage.getItem('token')) {
   *       return {
   *         headers: {
   *           Authorization: `Bearer ${localStorage.getItem('token')}`,
   *         },
   *       }
   *     }
   *   },
   *   beforeSend() {
   *     console.log('Doing something before every request');
   *   },
   *   afterSend(response) {
   *     console.log('Doing after before every request');
   *   },
   *   defaultResponseType: 'text',
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
    dynamicOptions,
    beforeSend,
    afterSend,
    defaultResponseType = 'json',
    errorHandler,
    errorMsgTemplate,
    ...defaultOptions
  } = {}) {
    this.baseURL = baseURL;
    this.dynamicOptions = dynamicOptions;
    this.beforeSend = beforeSend;
    this.afterSend = afterSend;
    this.defaultResponseType = defaultResponseType;
    this.errorHandler = errorHandler;
    this.errorMsgTemplate = errorMsgTemplate;
    this.defaultOptions = defaultOptions;
  }

  /**
   * The default error message.
   *
   * @private
   * @param {Object} options
   * @param {('GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD')} options.method - The CRUD method.
   * @param {string} [options.errorMsgNoun = ''] - Appended error message noun to global error
   * handler.
   * @param {string} [options.errorMsg = ''] - Error message used to global error handler. Overrides
   * `errorMsgNoun`
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

  async getDynamicOptions() {
    let dynamicOptions;

    if (typeof this.dynamicOptions === 'function') {
      const isDynamicOptionsAsync = this.dynamicOptions.constructor.name === 'AsyncFunction';

      // Await function if is async
      if (isDynamicOptionsAsync) {
        // Await and do something before every request
        dynamicOptions = await this.dynamicOptions();
      } else {
        // Do something before every request
        dynamicOptions = this.dynamicOptions();
      }
    }

    return dynamicOptions;
  }

  async mergeOptions({ rest, defaultOptionsUsed }) {
    let options;

    const dynamicOptions = await this.getDynamicOptions();

    if (defaultOptionsUsed) {
      let defaultOptions = deepMerge({}, this.defaultOptions);

      if (dynamicOptions !== undefined) { // If dynamicOptions() has return value
        if (!FarFetchHelper.isPlainObject(dynamicOptions)) {
          throw new TypeError('Return value of beforeSend() must be plain object');
        }

        // Deep merge default options and beforeSend() options; beforeSendOptions takes precedence
        defaultOptions = deepMerge(defaultOptions, dynamicOptions);
      }

      // Deep merge with single request; single request takes precedence
      options = deepMerge(defaultOptions, rest);
    } else {
      options = rest;
    }

    return options;
  }

  /**
   * Set options to conform to FarFetch
   *
   * @private
   * @param {Object} options
   * @param {Object.<string, string|number|null|boolean|Array|Object>} [options.data = {}] - Data
   * sent to server on request. Will use `body` for: POST, PUT, PATCH and `URL query params string`
   * for: GET, HEAD, DELETE.
   * @param {Object.<string, string|number|null|boolean|Array|Object>} [options.URLParams = {}] -
   * URL query params string. Don't use both `data` and `URLParams` together with GET, HEAD or
   * DELETE, as they're redundant in these cases. Pick one or the other, as they will both have the
   * same effect.
   * @param {Object} [options.dynamicOptions = {}] - Dynamic options to be set, like a token stored
   * in localStorage.
   * @param {boolean} [options.defaultOptionsUsed = true] - Will this specific request use the
   * default options specified on instantiation and the return value of `dynamicOptions()`?
   * @param {File|File[]|Object.<string, File>|Object.<string, File[]>} [options.files] - Files to
   * upload to server.
   * @param {...RequestInit} [options.rest = {}] -
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|Init options}
   * from Fetch API.
   */
  async setFetchOptions({
    data = {},
    URLParams = {},
    defaultOptionsUsed,
    files,
    ...rest
  }) {
    let options = await this.mergeOptions({ rest, defaultOptionsUsed });

    let queryString = '';

    const contentTypeHeader = options.headers?.['Content-Type'];

    const isFormURLEncoded = contentTypeHeader?.includes('application/x-www-form-urlencoded');

    queryString = FarFetchHelper.objectToQueryString(URLParams);

    if (files) { // Files property used, so must be upload
      const formData = FarFetchHelper.createFormData({ files, data });

      options.body = formData;

      // File upload shouldn't have a content supplied; it will auto-detect
      delete options.headers?.['Content-Type'];
    // Data object has at least one property
    } else if (Object.keys(data).length > 0) {
      // Default is URL query string. GET/HEAD can't be used with body. Body is optional for DELETE.
      if (options.method === 'GET' || options.method === 'DELETE' || options.method === 'HEAD') {
        if (Object.keys(data).length > 0 && Object.keys(URLParams).length > 0) {
          throw new FarFetchError(`Don't use both 'data' and 'URLParams' together with GET, HEAD or 
          DELETE, as they're redundant in these cases. Pick one or the other, as they will both have
          the same effect, but prefer 'data' in this case for consistency.`);
        }

        queryString = FarFetchHelper.objectToQueryString(data);
      } else if (isFormURLEncoded) { // FormURLEncoded requires URL params in body
        options.body = new URLSearchParams(data);
      } else if (options.method === 'POST' || options.method === 'PUT'
        || options.method === 'PATCH') {
        // JSON content-type header is necessary to match JSON body
        options = deepMerge(options, { headers: { 'Content-Type': 'application/json' } });

        options.body = JSON.stringify(data);
      }
    }

    return { queryString, options };
  }

  /**
   * @private
   * @param {Object} options
   * @param {Response} option.response - Fetch API response object.
   * @param {ResponseType} [options.responseType = this.defaultResponseType] - The response type.
   * @returns {Promise<ResponsePlus>} - Modified response object with the sepcified response type
   * properties as transformed body for syntactic sugar.
   */
  static async modifiedResponse({ response, responseType }) {
    const responseContentType = response.headers.get('Content-Type');

    // Deep cloning response object to prevent mutation. Cloning response before body transformation
    // allows body to be re-transformed.
    const responseCloned = response.clone();

    // responseData will always be added, even if the response body isn't transformed
    let responseData = null;

    // Valid response and has a content type.
    if (
      FarFetchHelper.isValidReturnType(responseType) && responseType !== null
      && responseContentType
    ) {
      responseData = await response[responseType]();
    }

    Object.assign(responseCloned, { responseData });

    return responseCloned;
  }

  getFullURL({ url, queryString }) {
    let fullURL = `${url}${queryString}`;

    // Base URL is given and URL on request is a relative path
    if ((this.baseURL) && !FarFetchHelper.isAbsoluteURL(url)) {
      const prependURL = this.baseURL;

      fullURL = `${prependURL}${fullURL}`;
    }

    return fullURL;
  }

  async runBeforeSend({ beforeSendObjectParameters }) {
    const { globalBeforeSend } = beforeSendObjectParameters;

    // If globalBeforeSend option is set to true and beforeSend() declared on instantiation
    if (globalBeforeSend && typeof this.beforeSend === 'function') {
      const isBeforeSendAsync = this.beforeSend.constructor.name === 'AsyncFunction';

      // Await function if is async
      if (isBeforeSendAsync) {
        // Await and do something before every request
        await this.beforeSend(beforeSendObjectParameters);
      } else {
        // Do something before every request
        this.beforeSend(beforeSendObjectParameters);
      }
    }
  }

  async runAfterSend({ globalAfterSend, response }) {
    // If globalAfterSend option is set to true and afterSend() declared on instantiation
    if (globalAfterSend && typeof this.afterSend === 'function') {
      const isAfterSendAsync = this.afterSend.constructor.name === 'AsyncFunction';

      if (isAfterSendAsync) {
        // Await and do something after every request
        await this.afterSend(response);
      } else {
        // Do something after every request
        this.afterSend(response);
      }
    }
  }

  async runErrorHandler({
    response, error, errorMsg, errorMsgNoun, options,
  }) {
    // Global error handler needs to be declared and either
    // an entire errorMsg or just the appended errorMsgNoun need to be declared
    if (typeof this.errorHandler === 'function' && (errorMsg || errorMsgNoun)) {
      const userMessage = this.userMessage({
        errorMsg,
        errorMsgNoun,
        method: options.method,
      });

      const isErrorHandlerAsync = this.errorHandler.constructor.name === 'AsyncFunction';

      if (isErrorHandlerAsync) {
        // Await error handler
        await this.errorHandler({ error, response, userMessage });
      } else {
        // Non-await error handler
        this.errorHandler({ error, response, userMessage });
      }
    }
  }

  /**
   * Request function called on every CRUD function.
   *
   * @param {string} url - The URL.
   * @param {Object} options
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
    URLParams = {},
    files,
    errorMsg = '',
    errorMsgNoun = '',
    globalBeforeSend = true,
    globalAfterSend = true,
    defaultOptionsUsed = true,
    responseType = this.defaultResponseType,
    ...rest
  }) {
    const { queryString, options } = await this.setFetchOptions({
      data,
      URLParams,
      defaultOptionsUsed,
      files,
      ...rest,
    });

    const beforeSendObjectParameters = {
      url,
      fetchAPIOptions: options,
      data,
      URLParams,
      queryString,
      files,
      errorMsg,
      errorMsgNoun,
      globalBeforeSend,
      globalAfterSend,
      defaultOptionsUsed,
      responseType,
    };

    await this.runBeforeSend({ beforeSendObjectParameters });

    let response = '';

    try {
      const fullURL = this.getFullURL({ url, queryString });

      response = await fetch(fullURL, options);

      if (!response.ok) throw new FarFetchError('Server error.');

      response = await FarFetch.modifiedResponse({ response, responseType });

      await this.runAfterSend({ globalAfterSend, response });
    } catch (error) {
      if (
        typeof this.errorHandler === 'function' && (errorMsg || errorMsgNoun)
        && response && !Object.hasOwn(response, 'responseData')
      ) {
        // Has a response, but hasn't been mofified yet
        response = await FarFetch.modifiedResponse({ response, responseType });
      }

      await this.runErrorHandler({
        response, error, errorMsg, errorMsgNoun, options,
      });

      // Throw request object to all manually handling exception and stop execution for sequential
      // tasks
      if (error instanceof FarFetchError) {
        throw new FarFetchError({ error, response });
      } else {
        throw error;
      }
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
