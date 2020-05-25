# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2020-05-24

### Fixed

- Issue where init options would get cached if not reloaded, due to lodash merge
  mutating original. New [deepmerge](https://github.com/TehShrike/deepmerge)
  fixes this issue.

## [1.1.0] - 2020-05-24

### Changed
- Remove `setDefaultOptions()`, in favor of simply returning object on
  `beforeSend()`.