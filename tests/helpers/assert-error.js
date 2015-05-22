'use strict';

var assert            = require('chai').assert;
var DependencyError   = require('../../lib/dependency-error');

module.exports = function(project, type) {
  var checkDependencies = require('./check-dependencies')(project);
  assert.throws(checkDependencies, DependencyError, 'Missing ' + type + ' packages');
};
