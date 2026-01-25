# Changelog

This repository contains the app that composes the UI and the `libs/core` library that provides the GitHub API client. The top-level changelog records app-level notes and points to the core and docs changelogs for package-specific history.

## [Unreleased]

- Migration note: the app's access token localStorage key has been renamed to `__access_token`. After upgrading, users will need to sign in again to refresh their session and obtain a new token. The application also stores profile state under the `profile-storage` localStorage key.

- See `libs/core/CHANGELOG.md` for the core library release history and technical changes related to the client implementation.

Note: `DOCS/CHANGELOG.md` is preserved for documentation history and is not modified by this change.
