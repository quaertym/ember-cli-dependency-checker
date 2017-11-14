'use strict';

var assertError   = require('../helpers/assert-error');
var assertNoError = require('../helpers/assert-no-error');
var DependencyChecker = require('../../lib/dependency-checker');
var projectBuilder = require('../helpers/project-builder');

describe('EmberCLIDependencyChecker', function() {
  beforeEach(function(){
    DependencyChecker.setAlreadyChecked(false);
  });

  packageManagerTest('yarn');
  packageManagerTest('npm');

  function packageManagerTest(packageManagerName) {
    function createProject(dependencies, options) {
      options = options || {};
      options.root = options.root || 'tests/fixtures/project-' + packageManagerName + '-check';
      options.dependencies = projectBuilder.buildDependencies(dependencies);
      return projectBuilder.build(options);
    }

    var assertPackageManagerError = function(project) {
      return assertError(project, packageManagerName);
    };

    var assertNoPackageManagerError = function(project) {
      return assertNoError(project, packageManagerName);
    };

    describe('reports unsatisfied ' + packageManagerName + ' dependencies', function() {
      it('when the specified package is not installed', function() {
        var project = createProject({ 'foo': '0.1.1', 'ember-cli': '1.2.3' });
        assertPackageManagerError(project);
      });

      it('when the installed package does not match the version specified', function() {
        var project = createProject({ 'ember-cli': '0.1.1' });
        assertPackageManagerError(project);
      });

      it('when the installed package does not satisfy the version range specified', function() {
        var project = createProject({ 'ember-cli': '>1.3.2 <=2.3.4' });
        assertPackageManagerError(project);
      });

      it('when the installed package is not compatible with the version specified', function() {
        var project = createProject({ 'ember-cli': '0.2.x' });
        assertPackageManagerError(project);
      });

      it('when the version specified is a Git repo with a semver tag and there is a version mismatch', function() {
        var project = createProject({ 'ember-cli': 'git://github.com/stefanpenner/ember-cli.git#v0.1.0' });
        assertPackageManagerError(project);
      });
    });

    describe('does not report satisfied ' + packageManagerName + ' dependencies', function() {
      it('when the installed package matches the version specified', function() {
        var project = createProject({ 'ember-cli': '1.2.3' });
        assertNoPackageManagerError(project);
      });

      it('when the installed package satisfies the version range specified', function() {
        var project = createProject({ 'ember-cli': '>1.0.0' });
        assertNoPackageManagerError(project);
      });

      it('when the installed package is compatible with the version specified', function() {
        var project = createProject({ 'ember-cli': '^1.2.0' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a URL', function() {
        var project = createProject({ 'ember-cli': 'http://ember-cli.com/ember-cli.tar.gz' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a Git repo with a non-semver tag', function() {
        var project = createProject({ 'ember-cli': 'git://github.com/stefanpenner/ember-cli.git#master' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a local path', function() {
        var project = createProject({ 'ember-cli': '~/projects/ember-cli' });
        assertNoPackageManagerError(project);
      });

      it('does NOT error with a * dependency', function() {
        var project = createProject({ 'ember-cli': '*' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is found outside the project root', function() {
        var project = createProject({ 'example-package': '1.2.3' }, { root: 'tests/fixtures/outside-root-' + packageManagerName + '-project/project' });
        assertNoPackageManagerError(project);
      });
    });

    describe('sibling node_modules/ directory', function() {
      it('checks depdencies', function() {
        var project = createProject({
          'ember-cli': '*'
        }, {
          root: 'tests/fixtures/project-' + packageManagerName + '-sibling-node-modules-check/app',
          nodeModulesPath: 'tests/fixtures/project-' + packageManagerName + '-sibling-node-modules-check/node_modules',
        });
        assertNoPackageManagerError(project);
      });
    });
  }
});
