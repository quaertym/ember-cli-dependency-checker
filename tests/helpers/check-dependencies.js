'use strict';

const DependencyChecker = require('../../lib/dependency-checker');
const Reporter          = require('../../lib/reporter');

module.exports = function(project) {
  return function() {
    const reporter = new Reporter();
    const checker = new DependencyChecker(project, reporter);
    return checker.checkDependencies();
  };
};
