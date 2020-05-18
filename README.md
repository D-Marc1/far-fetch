# FarFetch Class

Modern Fetch API wrapper for simplicity.

## Install

```
npm i @websitebeaver/far-fetch
```

Then include it in the files you want to use it in like so:

```js
import FarFetch from '@websitebeaver/far-fetch';

// If you need to manually handle errors
import FarFetch, { FarFetchError } from '@websitebeaver/far-fetch';
```

## Instantiating Class

```js
const ff = new FarFetch();
```

This is how you'd create a class in its simplest form in `FarFetch`. You can
check out [all the options you can use here](#new-farfetchoptions).

It is recommended to then import the initialized class on every page used.

## Why Use FarFetch?

While JavaScript's native `Fetch API` was an amazing feature added, it
introduced a myriad of inconsistencies, which cause you to have to copy and
paste StackOverflow questions for simple boilerplate code often times. This is
especially the case with uploading files and I find it hard to believe anyone
just straight memorizes how to do it. There's so many things to think about. It
would have been so much better in a unified experience.

The core philosophy of `FarFetch` to is keep things as similar as possible to
native JavaScript fetch, and merely improve upon it. This way, you're not really
learning a completely new API. Instead, the aim of this class is almost to pitch
which features I think are missing in `Fetch API`. The aim of this class isn't
to recreate the wheel, but rather, to improve upon `Fetch API`, with a super
thin wrapper. The main advantages over vanilla `Fetch` are as follows:

1. Ability to call syntactic sugar methods like `ff.get()`, `ff.post()`,
   `ff.put`, etc., rather than `fetch(url, { method: 'GET' })`. `FarFetch`
   allows both ways.
2. Ability to ["automatically" throw and handle errors](#error-handling) for
   every call in a unified manner with a global error handler.
3. Ability to use default [init options](#passing-in-fetch-api-init-options) on
   every call.
4. Ability to do actions before every request
   with[`beforeSend()` and `afterSend(response)` hooks](#beforeafter-send-hook).
5. Ability to [pass data to each call in a consistent manner](#passing-in-data-to-request).
6. Ability to [upload files](#uploading-files) in a consistent manner.

- [FarFetch Class](#farfetch-class)
  - [Install](#install)
  - [Instantiating Class](#instantiating-class)
  - [Why Use FarFetch?](#why-use-farfetch)
  - [Passing in Data to Request](#passing-in-data-to-request)
  - [Uploading Files](#uploading-files)
    - [Uploading One File](#uploading-one-file)
    - [Uploading Multiple Files](#uploading-multiple-files)
    - [Uploading Multiple Files with Distinct File Names](#uploading-multiple-files-with-distinct-file-names)
  - [Passing in Fetch API init options](#passing-in-fetch-api-init-options)
    - [Set Options for Single Request](#set-options-for-single-request)
    - [Set Global Options for Every Request](#set-global-options-for-every-request)
  - [Getting Response](#getting-response)
    - [Retrieving Response Data](#retrieving-response-data)
  - [Set Base URL](#set-base-url)
  - [Before/After Send Hook](#beforeafter-send-hook)
    - [Turn off Before/After Send Hook on Single Request](#turn-off-beforeafter-send-hook-on-single-request)
  - [Error Handling](#error-handling)
    - [Modifying the Default Error Message Template](#modifying-the-default-error-message-template)
    - [Overriding Default Error Message for Single Request](#overriding-default-error-message-for-single-request)
    - [Catching Exceptions Manually](#catching-exceptions-manually)
    - [Empty Try/Catch](#empty-trycatch)
- [API](#api)
  - [FarFetch](#farfetch)
    - [new FarFetch([options])](#new-farfetchoptions)
    - [farFetch.setDefaultOptions([...options])](#farfetchsetdefaultoptionsoptions)
    - [farFetch.fetch(url, options) ⇒ <code>Promise.&lt;ResponsePlus&gt;</code>](#farfetchfetchurl-options--promiseresponseplus)
    - [farFetch.get(url, [...options]) ⇒ <code>Promise.&lt;ResponsePlus&gt;</code>](#farfetchgeturl-options--promiseresponseplus)
    - [farFetch.post(url, [...options]) ⇒ <code>Promise.&lt;ResponsePlus&gt;</code>](#farfetchposturl-options--promiseresponseplus)
    - [farFetch.put(url, [...options]) ⇒ <code>Promise.&lt;ResponsePlus&gt;</code>](#farfetchputurl-options--promiseresponseplus)
    - [farFetch.patch(url, [...options]) ⇒ <code>Promise.&lt;ResponsePlus&gt;</code>](#farfetchpatchurl-options--promiseresponseplus)
    - [farFetch.delete(url, [...options]) ⇒ <code>Promise.&lt;ResponsePlus&gt;</code>](#farfetchdeleteurl-options--promiseresponseplus)
    - [farFetch.head(url, [...options]) ⇒ <code>Promise.&lt;ResponsePlus&gt;</code>](#farfetchheadurl-options--promiseresponseplus)
  - [FarFetchError ⇐ <code>Error</code>](#farfetcherror--error)
    - [new FarFetchError(message)](#new-farfetcherrormessage)

## Passing in Data to Request

Passing in data in `Fetch API` is exceedingly inconsistent. In this regard, it
really took a step backwards from how jQuery implemented passing in data, in my
opinion, at least from a usability standpoint. Of course `Fetch API`'s `body`
options offers more versatility, which is why `FarFetch` supports using `body`.
However, it really shouldn't necessary in the majority of use cases. Adding data
to a `GET` and `POST` request is done in two separate ways in `Fetch API`. `GET`
requests must use appended URL query parameters, while `POST` requests generally
use a stringified object used as the `body` property.

**Fetch API**

```js
// GET
async getPerson() {
  const data = { name: 'Bobby Big Boy', gender: 'Male', age: 5 };

  const queryString = `?${new URLSearchParams(Object.entries(data))}`;

  const response = await fetch(`https://example.com/people${queryString}`, {
    method: 'GET',
  });

  if(response.status !== 200) throw new Error('Server error.');

  return response.json();
}

// POST
async addPerson() {
  const data = { name: 'Bobby Big Boy', gender: 'Male', age: 5 };

  const response = await fetch(`https://example.com/people`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if(response.status !== 200) throw new Error('Server error.');

  return response.json();
}

// application/x-www-form-urlencoded
async addPerson() {
  const data = { name: 'Bobby Big Boy', gender: 'Male', age: 5 };

  const response = await fetch(`https://example.com/people`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(Object.entries(data)),
  });

  if(response.status !== 200) throw new Error('Server error.');

  return response.json();
}
```

**FarFetch**

```js
// GET
async getPerson() {
  const { responseJSON } = await ff.get('https://example.com/people', {
    data: { name: 'Bobby Big Boy', gender: 'Male', age: 5 },
  });

  return responseJSON;
}

// POST
async addPerson() {
  const { responseJSON } = await ff.post('https://example.com/people', {
    data: { name: 'Bobby Big Boy', gender: 'Male', age: 5 },
  });

  return responseJSON;
}

// application/x-www-form-urlencoded
async addPerson() {
  const { responseJSON } = await ff.post('https://example.com/people', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: { name: 'Bobby Big Boy', gender: 'Male', age: 5 },
  });

  return responseJSON;
}
```

Notice how each request is completely predictable in `FarFetch` and doesn't
require you to throw an exception if it's not a `200` status code. Sure, using
the native javascript `Fetch API` isn't horrible anymore in regular Javascript,
thanks to features like `URLSearchParams` and `Object.entries`, but it's so much
easier to not have to think much when you program. `FarFetch`'s consistent API
makes it a breeze to make any sort of request.

## Uploading Files

### Uploading One File

**Fetch API**

```js
async uploadFile() {
  const [file] = document.querySelector('#my-file').files;

  const data = { name: 'Bobby Big Boy', gender: 'Male', age: 5 };

  const formData = new FormData();

  formData.append('file', file);

  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]); // Add server data to formData
  });

  const response = await fetch('https://example.com/people', {
    method: 'POST',
    body: formData,
  });

  if(response.status !== 200) throw new Error('Server error.');
}
```

**FarFetch**

```js
async uploadFile() {
  const [file] = document.querySelector('#my-file').files;

  await ff.post('https://example.com/people', {
    data: { name: 'Bobby Big Boy', gender: 'Male', age: 5 },
    files: file,
  });
}
```

### Uploading Multiple Files

**Fetch API**

```js
async uploadFiles() {
  const files = document.querySelector('#my-files').files;

  const data = { name: 'Bobby Big Boy', gender: 'Male', age: 5 };

  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]); // Add server data to formData
  });

  files.forEach((file) => {
    formData.append('files[]', file); // Add files array to formData
  });

  await fetch('https://example.com/people', {
    method: 'POST',
    body: formData,
  });

  if(response.status !== 200) throw new Error('Server error.');
}
```

**FarFetch**

```js
async uploadFiles() {
  const files = document.querySelector('#my-files').files;

  await ff.post('https://example.com/people', {
    data: { name: 'Bobby Big Boy', gender: 'Male', age: 5 },
    files,
  });
}
```

### Uploading Multiple Files with Distinct File Names

**Fetch API**

```js
async uploadFiles() {
  const photos = document.querySelector('#photos').files;
  const videos = document.querySelector('#videos').files;
  const documents = document.querySelector('#documents').files;

  const data = { name: 'Bobby Big Boy', gender: 'Male', age: 5 };

  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]); // Add server data to formData
  });

  photos.forEach((photo) => {
    formData.append('photos[]', photo); // Add files array to formData
  });

  videos.forEach((video) => {
    formData.append('videos[]', video); // Add files array to formData
  });

  documents.forEach((document) => {
    formData.append('documents[]', document); // Add files array to formData
  });

  await fetch('https://example.com/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: formData,
  });

  if(response.status !== 200) throw new Error('Server error.');
}
```

**FarFetch**

```js
async uploadFiles() {
  const photos = document.querySelector('#photos').files;
  const videos = document.querySelector('#videos').files;
  const documents = document.querySelector('#documents').files;

  await ff.post('https://example.com/people', {
    data: { name: 'Bobby Big Boy', gender: 'Male', age: 22 },
    files: { photos, videos, documents },
  });
}
```

Look at how much more comprehensible the code becomes with `FarFetch`. This is
practically even readable by a non-programmer, as this reads as: *Let's add a 22
year old man named Bobby and upload his following files: photos, videos and
documents*.

## Passing in Fetch API init options

`FarFetch` accepts all [Fetch API init
options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters).
It's even possible to pass in the native fetch `body`, though its use is
discouraged in most cases, in favor of, `FarFetch`'s `data` parameter.

### Set Options for Single Request

```js
await ff.get('https://example.com', {
  headers: { 'Content-Type': 'application/json' },
  cache: 'reload',
})
```

### Set Global Options for Every Request

This is really handy for when you know for a fact you will be using the same
options on either every request or nearly all. You can accomplish this by
declaring these options when you instantiate `FarFetch`.

```js
const ff = new FarFetch({
  headers: { 'Content-Type': 'application/json' },
  cache: 'reload',
});
```

Sometimes you might not want to set a particular option when FarFetch is
created. Let's say you're using a login system. You don't want to have the `JWT`
be evaluated when you instantiate the class, since it won't work properly if a
user accesses the page logged out. The header would never reevaluate. This is
why `FarFetch` has a handy `setDefaultOptions()` function, which you can combine
with the global `beforeSend()` option.

```js
const ff = new FarFetch({
  beforeSend() {
    // Set header to token if token set in localStorage
    if (localStorage.getItem('token')) {
      this.setDefaultOptions({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    }
  },
});
```

*It should be noted that nested options, like `headers`, will currently override
what was set on instantiation*. For instance, if headers were set
initialization, like in the first example of this section, it would have the
following options:

```js
{
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
  cache: reload,
}
```

As stated before, only *nested* options get overridden, as `cache: reload` was
kept. The reason is because behind the scenes, `setDefaultOptions()` simply does
the following: `this.defaultOptions = { ...this.defaultOptions, ...options };`.
The same applies for when you override on individual requests as well.

## Getting Response

### Retrieving Response Data

`FarFetch` returns a [Response
object](https://developer.mozilla.org/en-US/docs/Web/API/Response), so you can
use [the `Body`
methods](https:/developer.mozilla.org/en-US/docs/Web/API/Body#Methods):
`arrayBuffer()`, `blob()`, `formData()`, `json()` and `text()`. This is exactly
how you'd be doing it in native `Fetch` as well.

`FarFetch` supports the vanilla `Fetch` way of retrieving data, by awaiting for
the the `Response` `Body` and transforming it to your type.

```js
const response = await ff.get('https://example.com/people');

const responseJSON = await response.json();

return responseJSON;
```

You can also use `FarFetch`'s handy `responseJSON` and `responseText`
properties for your convenience, instead of having to await for either `response.json()` or
`response.text()`, if the response header type is either `application/json` or
`text/plain`, respectively. These are properties that were simply added to the
`Response` object. What's also nice about this is that it ensures that getting
the JSON won't result in an error, due to a mismatch in header, as `FarFetch`
checks for this already, internally.

```js
const { responseJSON } = await ff.get('https://example.com/people');

return responseJSON;
```

```js
const { responseText } = await ff.get('https://example.com/people');

return responseText;
```

## Set Base URL

Most applications will likely use the same domain for most or even all requests.
`FarFetch` has a `baseURL` option you can use when you instantiate the class.

```js
const ff = new FarFetch({
  baseURL: 'https://example.com',
});
```

Now request like the following will work.

```js
await ff.get('/people');
```

But what if you want to use a different base URL for just a few requests in your
application? `FarFetch` automatically detects if an absolute path is used, and
will override the `baseURL`.

```js
await ff.get('https://notexample.com/posts');
```

## Before/After Send Hook

You can use the built-in `beforeSend()` hook to do something before every
request and the `afterSend(response)` one to do something after every request.

```js
const ff = new FarFetch({
  beforeSend() {
    console.log('do this before every request');
  },
  afterSend(response) {
    console.log('do this before every request');
  },
});
```

### Turn off Before/After Send Hook on Single Request

You might want to use the `beforeSend()` or `afterSend(response)` hook on nearly
all requests, but turn it off certain ones.

```js
await ff.get('http://example.com/', {
  globalBeforeSend: false,
  globalAfterSend: false,
});
```

## Error Handling

Another annoyance of `Fetch API` is that it doesn't automatically throw an error
on a failed request, and forces you to throw your own.

**Fetch API**

```js
const data = { name: 'Bobby Big Boy', gender: 'Male', age: 5 };

try {
  const response = await fetch('https://example.com/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if(response.status !== 200) throw new Error('Server error.');
} catch {
  alert('Error adding person');
}
```

Thankfully you don't need to worry about this with `FarFetch`. With `FarFetch`,
you can just append the noun to `errorMsgNoun` and it'll append to a
default template, dependent on the CRUD type.

**FarFetch**

```js
try {
  await ff.post('https://example.com/person', {
    data: { name: 'Bobby Big Boy', gender: 'Male', age: 5 },
    errorMsgNoun: 'person'
  });
} catch {}
```

Your global handler would then handle it as such:

```js
const ff = new FarFetch({
  errorHandler({ error, userMessage, response }) {
    if(response.status === 401) { // Unauthorized
      router.push('/login'); // Go to login page if logged out
    }

    // Error message will be presented to the user in an alert
    alert(userMessage);
  },
});
```

If an error occurs, this will result in an alert with the following message:

> Error adding person.

You might be wondering how this works behind the scenes.
Here's the basic template of what going into the `userMessage` parameter
property.

```js
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

const userMessage = `Error ${action} ${errorMsgNoun}`;
```

### Modifying the Default Error Message Template

You can even override this default template with the `errorMsgTemplate`
property, which accepts function.

```js
const ff = new FarFetch({
  errorMsgTemplate: ({ method, errorMsgNoun }) => {
    let action = '';

    if (method === 'GET' || method === 'HEAD') {
      action = 'retrieving';
    } else if (method === 'POST') {
      action = 'posting';
    } else if (method === 'PUT' || method === 'PATCH') {
      action = 'changing';
    } else if (method === 'DELETE') {
      action = 'removing';
    }

    return `Error ${action} ${errorMsgNoun}.`;
  },
});
```

In case you couldn't tell by this contrived example, I merely used synonyms of
the default template. However, this allows flexibility to tailor to
custom requirements.

### Overriding Default Error Message for Single Request

Sometimes you might just want to change the message for a unique request. You
can accomplish this via the `errorMsg` property.

```js
await ff.get('https://example.com/users', {
  errorMsg: 'Oh no! We are having trouble retrieving your friends!',
});
```

### Catching Exceptions Manually

Using the global `errorHandler()`, along with `errorMsgNoun` or `errorMsg`
should work fine in most cases, but sometimes you might need to handle multiple
cases. You can easily achieve this by simply omitting both `errorMsgNoun` and
`errorMsg`. `FarFetch` will then know not to run the global error handler. You
can then can the errors in a `try/catch`. Take a register account example for
instance.

```js
async register(type) {
  try {
    const response = await ff.post(`http://127.0.0.1:3333/${type}`, {
      data: {
        email: this.email,
        password: this.password,
      },
    });

    const responseData = await response.json();

    localStorage.setItem('token', responseData.token);

    this.$router.push('/');
  } catch (e) {
    if (e instanceof FarFetchError) {
      let userMessage = '';

      const { response, error } = e;

      if (response.status === 409) { // Conflict
        userMessage = 'Email is already in system';

        ff.errorHandler({ error, response, userMessage });
      } else if (response.status === 400) { // Validation failed
        const { field, validationMsg } = response.responseJSON;

        userMessage = `${field} is ${validationMsg}`;

        ff.errorHandler({ error, response, userMessage });
      }
    } else {
      userMessage = e.message;

      ff.errorHandler({ error, userMessage });
    }
  }
}
```

Each case his handled individually. You can then add the string to the global
error handler you created on instantiation, with
`ff.errorHandler({ error, response, userMessage })`.

### Empty Try/Catch

It is **required** to use a `try/catch` on every request in `FarFetch`, in order
to stop execution on an error. This isn't because there's anything
unique about how this library does anything; the same recommendation would apply
to any async request in JavaScript that relies on sequential steps occurring on
success. `FarFetch` specifically throws an error to stop the further execution
of code. Perhaps an example would help illustrate my point better.

Consider how a simple register account might work, like in the previous example.
You make a request and if there aren't any issues, like email already taken or
validation issues, you set the `localStorage` to the `JWT` and then route to the
logged in page. The problem is that if you an exception isn't thrown, there's
nothing to stop the script's execution, and it'll *always* set `localStorage`
and try to route to the logged in route, even if the request failed.

# API

## Classes

<dl>
<dt><a href="#FarFetch">FarFetch</a></dt>
<dd><p>CRUD class to simplify fetch API and uploading.</p></dd>
<dt><a href="#FarFetchError">FarFetchError</a></dt>
<dd><p>FarFetch Error class.</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#RequestException">RequestException</a> : <code>object</code></dt>
<dd><p>The Request exception object.</p>
</dd>
<dt><a href="#ResponsePlus">ResponsePlus</a> : <code>object</code></dt>
<dd><p>Request object plus responseJSON and responseText properties if correct header type.</p>
</dd>
<dt><a href="#errorHandlerCallback">errorHandlerCallback</a> : <code>function</code></dt>
<dd><p>Callback for global error handler.</p>
</dd>
<dt><a href="#afterSendCallback">afterSendCallback</a> : <code>function</code></dt>
<dd><p>Callback for global after send hook.</p>
</dd>
<dt><a href="#errorMsgTemplateCallback">errorMsgTemplateCallback</a> ⇒ <code>string</code></dt>
<dd><p>Callback for overriding default error message template.</p>
</dd>
<dt><a href="#RequestOptions">RequestOptions</a> : <code>object</code></dt>
<dd><p>The request object options.</p>
</dd>
</dl>

<a name="FarFetch"></a>

## FarFetch
CRUD class to simplify fetch API and uploading.

**Kind**: global class  

* [FarFetch](#FarFetch)
    * [new FarFetch([options])](#new_FarFetch_new)
    * [.setDefaultOptions([...options])](#FarFetch+setDefaultOptions)
    * [.fetch(url, options)](#FarFetch+fetch) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
    * [.get(url, [...options])](#FarFetch+get) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
    * [.post(url, [...options])](#FarFetch+post) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
    * [.put(url, [...options])](#FarFetch+put) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
    * [.patch(url, [...options])](#FarFetch+patch) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
    * [.delete(url, [...options])](#FarFetch+delete) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
    * [.head(url, [...options])](#FarFetch+head) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)

<a name="new_FarFetch_new"></a>

### new FarFetch([options])
Create FarFetch object.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> | <code>{}</code> | Set options. |
| [options.baseURL] | <code>string</code> | <code>&#x27;&#x27;</code> | Base URL for each request. |
| [options.beforeSend] | <code>function</code> |  | Function to do something before each fetch request. |
| [options.afterSend] | [<code>afterSendCallback</code>](#afterSendCallback) |  | Function to do something after each fetch request. |
| [options.errorHandler] | [<code>errorHandlerCallback</code>](#errorHandlerCallback) |  | Global error handler. |
| [options.errorMsgTemplate] | [<code>errorMsgTemplateCallback</code>](#errorMsgTemplateCallback) |  | Function to modify the default error message template for `errorMsgNoun`. |
| [...options.RequestOptions] | [<code>RequestOptions</code>](#RequestOptions) |  |  |

**Example**  
```js
const ff = new FarFetch({
  beforeSend() {
    console.log('Doing something before every request');
  },
  afterSend(response) {
    console.log('Doing after before every request');
  },
  errorHandler({ error, userMessage, response }) {
    if(response.status === 401) { // Unauthorized
      router.push('/login');
    }

    alert(userMessage); // Error message from either errorMsg or errorMsgNoun will be used
  },
  headers: { 'Content-Type': 'application/json' },
});
```
<a name="FarFetch+setDefaultOptions"></a>

### farFetch.setDefaultOptions([...options])
Set default options.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  

| Param | Type |
| --- | --- |
| [...options] | [<code>RequestOptions</code>](#RequestOptions) | 

<a name="FarFetch+fetch"></a>

### farFetch.fetch(url, options) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
Request function called on every CRUD function.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  
**Throws**:

- [<code>RequestException</code>](#RequestException) 


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL. |
| options | <code>object</code> |  |
| options.method | <code>&#x27;GET&#x27;</code> \| <code>&#x27;POST&#x27;</code> \| <code>&#x27;PUT&#x27;</code> \| <code>&#x27;PATCH&#x27;</code> \| <code>&#x27;DELETE&#x27;</code> \| <code>&#x27;HEAD&#x27;</code> | The CRUD method. |
| [...options.RequestOptions] | [<code>RequestOptions</code>](#RequestOptions) |  |

**Example**  
```js
await ff.fetch('https://my-website.com/users', {
 method: 'GET',
 data: { id: 23 },
 errorMsgNoun: 'users',
});
```
<a name="FarFetch+get"></a>

### farFetch.get(url, [...options]) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
GET fetch request.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  
**Throws**:

- [<code>RequestException</code>](#RequestException) 


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL. |
| [...options] | [<code>RequestOptions</code>](#RequestOptions) |  |

**Example**  
```js
await ff.get('https://my-website.com/users', {
 data: { id: 23 },
 errorMsgNoun: 'users',
});
```
<a name="FarFetch+post"></a>

### farFetch.post(url, [...options]) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
POST fetch request. Will default to `'Content-Type': 'application/json'` for the request header
if `FarFetch` data option is provided.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  
**Throws**:

- [<code>RequestException</code>](#RequestException) 


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL. |
| [...options] | [<code>RequestOptions</code>](#RequestOptions) |  |

**Example**  
```js
await ff.post('https://my-website.com/user/23', {
 data: { gender: 'male', age: 39 },
 errorMsgNoun: 'user',
});
```
<a name="FarFetch+put"></a>

### farFetch.put(url, [...options]) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
PUT fetch request. Will default to `'Content-Type': 'application/json'` for the request header
if `FarFetch` data option is provided.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  
**Throws**:

- [<code>RequestException</code>](#RequestException) 


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL. |
| [...options] | [<code>RequestOptions</code>](#RequestOptions) |  |

**Example**  
```js
await ff.put('https://my-website.com/user/47', {
 data: { gender: 'female', age: 22 },
 errorMsgNoun: 'user',
});
```
<a name="FarFetch+patch"></a>

### farFetch.patch(url, [...options]) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
PATCH fetch request. Will default to `'Content-Type': 'application/json'` for the request
header if `FarFetch` data option is provided.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  
**Throws**:

- [<code>RequestException</code>](#RequestException) 


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL. |
| [...options] | [<code>RequestOptions</code>](#RequestOptions) |  |

**Example**  
```js
await ff.patch('https://my-website.com/user/91', {
 data: { age: 18 },
 errorMsgNoun: 'user',
});
```
<a name="FarFetch+delete"></a>

### farFetch.delete(url, [...options]) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
DELETE fetch request.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  
**Throws**:

- [<code>RequestException</code>](#RequestException) 


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL. |
| [...options] | [<code>RequestOptions</code>](#RequestOptions) |  |

**Example**  
```js
await ff.delete('https://my-website.com/user/107', {
 errorMsgNoun: 'user',
});
```
<a name="FarFetch+head"></a>

### farFetch.head(url, [...options]) ⇒ [<code>Promise.&lt;ResponsePlus&gt;</code>](#ResponsePlus)
HEAD fetch request.

**Kind**: instance method of [<code>FarFetch</code>](#FarFetch)  
**Throws**:

- [<code>RequestException</code>](#RequestException) 


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL. |
| [...options] | [<code>RequestOptions</code>](#RequestOptions) |  |

**Example**  
```js
await ff.head('https://my-website.com/user/107');
```

<a name="FarFetchError"></a>

## FarFetchError ⇐ <code>Error</code>
FarFetch Error class.

**Kind**: global class  
**Extends**: <code>Error</code>  
<a name="new_FarFetchError_new"></a>

### new FarFetchError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> \| <code>object.&lt;string, \*&gt;</code> | Will be in the `message` property if a string or its own properties if object. |

<a name="RequestException"></a>

## RequestException : <code>object</code>
The Request exception object.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| error | <code>FarFetchError</code> | FarFetch error. |
| response | [<code>ResponsePlus</code>](#ResponsePlus) | Fetch API response plus added properties for syntactic sugar. |

<a name="ResponsePlus"></a>

## ResponsePlus : <code>object</code>
Request object plus responseJSON and responseText properties if correct header type.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| response | <code>Response</code> | Fetch API response [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response). |
| [response.responseJSON] | <code>object</code> | FarFetch added property that transforms the body to JSON for syntactic sugar if the same response header type. |
| [response.responseText] | <code>string</code> | FarFetch added property that transforms the body to text for syntactic sugar if the same response header type. |

<a name="errorHandlerCallback"></a>

## errorHandlerCallback : <code>function</code>
Callback for global error handler.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.error | <code>FarFetchError</code> \| <code>Error</code> | The FarFetchError option. Will throw regular error if needed. |
| options.response | [<code>ResponsePlus</code>](#ResponsePlus) | Request object plus responseJSON and responseText properties if correct header type. |
| options.userMessage | <code>string</code> | The message given to the user. |

<a name="afterSendCallback"></a>

## afterSendCallback : <code>function</code>
Callback for global after send hook.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| response | [<code>ResponsePlus</code>](#ResponsePlus) | Request object plus responseJSON and responseText properties if correct header type. |

<a name="errorMsgTemplateCallback"></a>

## errorMsgTemplateCallback ⇒ <code>string</code>
Callback for overriding default error message template.

**Kind**: global typedef  
**Returns**: <code>string</code> - Full error message string.  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>&#x27;GET&#x27;</code> \| <code>&#x27;POST&#x27;</code> \| <code>&#x27;PUT&#x27;</code> \| <code>&#x27;PATCH&#x27;</code> \| <code>&#x27;DELETE&#x27;</code> \| <code>&#x27;HEAD&#x27;</code> | The CRUD method. |
| errorMsgNoun | <code>string</code> | The error message noun. |

<a name="RequestOptions"></a>

## RequestOptions : <code>object</code>
The request object options.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [data] | <code>object.&lt;string, (string\|number\|null\|boolean)&gt;</code> | <code>{}</code> | Data sent to server on request. |
| [files] | <code>File</code> \| <code>Array.&lt;File&gt;</code> \| <code>object.&lt;string, File&gt;</code> \| <code>object.&lt;string, Array.&lt;File&gt;&gt;</code> |  | Files to upload to server. Will use `file` as key if literal and `files[]` if array; if object, will use properties as keys. |
| [errorMsgNoun] | <code>string</code> | <code>&#x27;&#x27;</code> | Appended error message noun to global error handler. |
| [errorMsg] | <code>string</code> | <code>&#x27;&#x27;</code> | Error message used to global error handler. Overrides `errorMsgNoun` |
| [globalBeforeSend] | <code>boolean</code> | <code>true</code> | Will this specific request use the beforeSend() hook? |
| [globalAfterSend] | <code>boolean</code> | <code>true</code> | Will this specific request use the afterSend() hook? |
| [defaultOptionsUsed] | <code>boolean</code> | <code>true</code> | Will this specific request use the default options specified on instantiation or with `setDefaultOptions()`? |
| [...rest] | <code>object</code> | <code>{}</code> | [Init options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) from Fetch API. |
