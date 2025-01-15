# Change Log

All notable changes to the "code-analyzer-js" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2025-01-15
### Added
- Improved analysis of `for` loops to correctly identify when to replace with `map`, `filter`, or `reduce`.
- Support for processing all identified modifications in the code at once, avoiding the need to run the command multiple times.

### Fixed
- Fixed logic to correctly identify and suggest optimizations for multiple loops within the same file.
- Ensured that variable declarations are commented along with their related loops when necessary.

## [1.0.0] - 2025-01-14
### Added
- Initial release of the extension.
- Detection of `for` loops and suggestion to replace them with higher-order functions (`map`, `filter`, and `reduce`).
- Automatic commenting of the original code and insertion of the optimized version.
