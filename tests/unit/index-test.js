/* eslint-env node, mocha */
const assert = require('chai').assert;
const sinon = require('sinon');
const index = require('../../index');
const DependencyChecker = require('../../lib/dependency-checker');

// Simple stubbing of some basic inner workings of the module
const indexStub = {
  _super: { init: () => {} },
  ...index,
}

describe('index', function () {
  let argv;

  beforeEach(function() {
    // Keep a reference to the original arguments,
    // since we're going to fiddle with them.
    argv = process.argv;
  });

  afterEach(function() {
    // Restore the original arguments and any changes made through sinon.
    process.argv = argv;
    sinon.restore();
  });

  describe('command passed to ember is init', function () {
    it('does not check dependencies', function () {
      // Arrange
      const dependenciesChecked = sinon.stub(DependencyChecker.prototype, 'checkDependencies');
      const extraArgs = ['/path/to/ember', 'init', 'something-else'];
      process.argv = [...process.argv, ...extraArgs];

      // Act
      indexStub.init();

      // Assert
      assert.isFalse(dependenciesChecked.called, 'Dependencies have not been checked');
    });
  });

  describe('command passed to ember is not init', function () {
    it('checks dependencies', function () {
      // Arrange
      const dependenciesChecked = sinon.stub(DependencyChecker.prototype, 'checkDependencies');
      const extraArgs = ['/path/to/ember', 'link', 'something-else'];
      process.argv = [...process.argv, ...extraArgs];

      // Act
      indexStub.init();

      // Assert
      assert.isTrue(dependenciesChecked.called, 'Dependencies have not been checked');
    });
  });
});
