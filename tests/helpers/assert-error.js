'use strict';

var assert            = require('chai').assert;
var DependencyChecker = require('../../lib/dependency-checker');
var DependencyError   = require('../../lib/dependency-error');
var Reporter          = require('../../lib/reporter');

module.exports = function(project, type) {
  var checkDependencies = function() {
    var reporter = new Reporter();
    var checker = new DependencyChecker(project, reporter);
    return checker.checkDependencies();
  };

  assert.throws(checkDependencies, DependencyError, 'Missing ' + type + ' packages');
};
