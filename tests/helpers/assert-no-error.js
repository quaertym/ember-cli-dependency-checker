'use strict';

var assert            = require('chai').assert;
var DependencyChecker = require('../../lib/dependency-checker');
var DependencyError   = require('../../lib/dependency-error');

module.exports = function(project, type) {

  var includeDependencyChecker = function() {
    var dependencyChecker = new DependencyChecker(project);
    dependencyChecker.included();
  };

  assert.doesNotThrow(includeDependencyChecker, DependencyError, 'Missing ' + type + 'packages');
  DependencyChecker.setAlreadyChecked(false);
};
