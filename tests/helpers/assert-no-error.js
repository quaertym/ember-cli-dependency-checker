'use strict';

const assert            = require('chai').assert;
const DependencyError   = require('../../lib/dependency-error');

module.exports = function(project, type) {
  const checkDependencies = require('./check-dependencies')(project);
  assert.doesNotThrow(checkDependencies, DependencyError, 'Missing ' + type + ' packages');
};
