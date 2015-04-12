'use strict';

var Reporter = require('./lib/reporter');
var DependencyChecker = require('./lib/dependency-checker');

module.exports = function emberCliDependencyCheckerAddon(project) {
  var reporter = new Reporter();
  var dependencyChecker = new DependencyChecker(project, reporter);
  dependencyChecker.checkDependencies();

  return {
    name: 'ember-cli-dependency-checker'
  };
};
