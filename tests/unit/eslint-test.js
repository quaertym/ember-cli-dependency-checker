'use strict';

var lint = require('mocha-eslint');

var paths = [
  'lib/**/*.js',
  'tests/**/*.js',
  '!tests/fixtures/**',
];

var options = {
  strict: true,  // Defaults to `false`, only notify the warnings
};

// Run the tests
lint(paths, options);
