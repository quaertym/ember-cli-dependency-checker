'use strict';

var Reporter = require('./lib/reporter');
var DependencyChecker = require('./lib/dependency-checker');

module.exports = {
  name: 'ember-cli-dependency-checker',

  included: function(project) {
    var reporter = new Reporter();
    var dependencyChecker = new DependencyChecker(project, reporter);

    return dependencyChecker.checkDependencies();
  }
};
