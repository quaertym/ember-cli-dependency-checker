'use strict';

const lint = require('mocha-eslint');

const paths = [
  'lib/**/*.js',
  'tests/**/*.js',
  '!tests/fixtures/**',
];

const options = {
  strict: true,  // Defaults to `false`, only notify the warnings
};

// Run the tests
lint(paths, options);
