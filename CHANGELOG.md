# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed

- `localBaseURL` option removed

### Fixed

- Fixed typo in README on array/object as value for key.
- Fixed typo in docs where it said to be using `beforeSend()` return instead of
`dynamicOptions()`.

## [2.0.0] - 2022-01-16

### Added

- `dynamicOptions()` returns dynamic options instead of `beforeSend()`; accepts
`await`.
- `localBaseURL` option to automatically detect when working locally.
- Missing testing.

### Changed

- `beforeSend()` callback parameter now has the current URL and all the request
options as object parameters.
- `beforeSend()` return is not longer used for dynamic options, as a dedicated
`dynamicOptions()` function is now used for that.
- `afterSend()` and `errorHandler` accept `await`.

### Fixed

- Minor typos in `README` and docs.

## [1.2.0-1] - 2021-10-17

### Changed

- Add ability to have `async` `beforeSend()`.
- Fix minor typo in code where check for headers was before headers getting set

## [1.2.0-0] - 2021-06-11

### Changed

- Global error handler to catch all exceptions, instead of just response errors.

- Add ability to use `URLParams`, combined with `data` with `POST`, `PUT`, `PATCH`

- `JSON.stringify` URL query params that have an object or array type as value

## [1.1.3] - 2020-05-24

### Fixed

- Issue where options set in constructor gets overwritten and add deepMerge. Now
  it is actually fixed, as the root problem was the initial local variable
  shallow clone set.

## [1.1.2] - 2020-05-24

### Fixed

- Issue where options set in constructor gets overwritten and add deepMerge.
- Issue where POST overwrites headers.

## [1.1.1] - 2020-05-24

### Fixed

- Issue where init options would get cached if not reloaded, due to lodash merge
  mutating original. New [deepmerge](https://github.com/TehShrike/deepmerge)
  fixes this issue.

## [1.1.0] - 2020-05-24

### Changed

- Remove `setDefaultOptions()`, in favor of simply returning object on
  `beforeSend()`.
  