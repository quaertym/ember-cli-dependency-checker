'use strict';

var Reporter = require('./lib/reporter');
var DependencyChecker = require('./lib/dependency-checker');

module.exports = {
  name: 'ember-cli-dependency-checker',

  included: function(app) {
    var reporter = new Reporter();
    var dependencyChecker = new DependencyChecker(app.project, reporter);

    return dependencyChecker.checkDependencies();
  }
};
