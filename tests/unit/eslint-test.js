'use strict';

const lint = require('mocha-eslint');

let paths = [
  'lib/**/*.js',
  'tests/**/*.js',
  '!tests/fixtures/**',
];

let options = {
  strict: true,  // Defaults to `false`, only notify the warnings
};

// Run the tests
lint(paths, options);
