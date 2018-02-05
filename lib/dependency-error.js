'use strict';

class DependencyError extends Error {
  constructor(message) {
    super();
    this.name    = 'DependencyError';
    this.message = message;

    if (process.env.EMBER_VERBOSE_ERRORS === 'true') {
      this.stack = (new Error()).stack;
      this.suppressStacktrace = false;
    } else {
      this.suppressStacktrace = true;
    }
  }

  static isDependencyError(object) {
    return object instanceof DependencyError;
  }
}

module.exports = DependencyError;
