'use strict';

const Reporter = require('./lib/reporter');
const DependencyChecker = require('./lib/dependency-checker');

module.exports = {
  name: 'ember-cli-dependency-checker',
  init: function() {
    this._super.init && this._super.init.apply(this, arguments);

    // When running `ember <command>`, find the `<command>`
    const emberPosition = process.argv.findIndex(arg => arg.endsWith('/ember'));
    const ranWithInit = process.argv[emberPosition + 1] === 'init';

    if (!ranWithInit) {
      const reporter = new Reporter();
      const dependencyChecker = new DependencyChecker(this.project, reporter);
      dependencyChecker.checkDependencies();
    }
  }
};
