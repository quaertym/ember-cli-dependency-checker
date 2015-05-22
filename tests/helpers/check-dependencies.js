'use strict';

var DependencyChecker = require('../../lib/dependency-checker');
var Reporter          = require('../../lib/reporter');

module.exports = function(project) {
  return function() {
    var reporter = new Reporter();
    var checker = new DependencyChecker(project, reporter);
    return checker.checkDependencies();
  };
};
