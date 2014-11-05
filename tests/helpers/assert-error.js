'use strict';

var assert            = require('chai').assert;
var DependencyChecker = require('../../lib/dependency-checker');
var DependencyError   = require('../../lib/dependency-error');

module.exports = function(project, type) {
  var dependencyChecker = function() {
    return new DependencyChecker(project);
  };

  assert.throws(dependencyChecker, DependencyError, 'Missing ' + type + ' packages');
  DependencyChecker.setAlreadyChecked(false);
};
