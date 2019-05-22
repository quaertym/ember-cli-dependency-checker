/* eslint-env node, mocha */
'use strict';

const assertError   = require('../helpers/assert-error');
const assertNoError = require('../helpers/assert-no-error');
const DependencyChecker = require('../../lib/dependency-checker');
const projectBuilder = require('../helpers/project-builder');

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

    const assertPackageManagerError = function(project) {
      return assertError(project, packageManagerName);
    };

    const assertNoPackageManagerError = function(project) {
      return assertNoError(project, packageManagerName);
    };

    describe('reports unsatisfied ' + packageManagerName + ' dependencies', function() {
      it('when the specified package is not installed', function() {
        const project = createProject({ 'foo': '0.1.1', 'ember-cli': '1.2.3' });
        assertPackageManagerError(project);
      });

      it('when the installed package does not match the version specified', function() {
        const project = createProject({ 'ember-cli': '0.1.1' });
        assertPackageManagerError(project);
      });

      it('when the installed package does not satisfy the version range specified', function() {
        const project = createProject({ 'ember-cli': '>1.3.2 <=2.3.4' });
        assertPackageManagerError(project);
      });

      it('when the installed package is not compatible with the version specified', function() {
        const project = createProject({ 'ember-cli': '0.2.x' });
        assertPackageManagerError(project);
      });

      it('when the version specified is a Git repo with a semver tag and there is a version mismatch', function() {
        const project = createProject({ 'ember-cli': 'git://github.com/stefanpenner/ember-cli.git#v0.1.0' });
        assertPackageManagerError(project);
      });

      it('when the version specified is a url to a tar.gz  and a _from is provided in the package.json and does not match', function() {
        const project = createProject({ 'example-tar-gz': 'http://ember-cli.com/example-3.0.0.tar.gz' }, { root: 'tests/fixtures/project-'+ packageManagerName + '-tar-gz-check' });
        assertPackageManagerError(project);
      });

      it('when the version specified is a url to a tar.gz  and no package is installed', function() {
        const project = createProject({ 'example-2-tar-gz': 'http://ember-cli.com/example-2-2.0.0.tar.gz' }, { root: 'tests/fixtures/project-'+ packageManagerName + '-tar-gz-check' });
        assertPackageManagerError(project);
      });

      it('when the specified bower package is not installed via npm', function() {
        const project = createProject({ '@bower_components/foo': '0.1.1' });
        assertPackageManagerError(project);
      });
    });

    describe('does not report satisfied ' + packageManagerName + ' dependencies', function() {
      it('when the installed package matches the version specified', function() {
        const project = createProject({ 'ember-cli': '1.2.3' });
        assertNoPackageManagerError(project);
      });

      it('when the installed package satisfies the version range specified', function() {
        const project = createProject({ 'ember-cli': '>1.0.0' });
        assertNoPackageManagerError(project);
      });

      it('when the installed package is compatible with the version specified', function() {
        const project = createProject({ 'ember-cli': '^1.2.0' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a URL', function() {
        const project = createProject({ 'ember-cli': 'http://ember-cli.com/ember-cli.tar.gz' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a Git repo with a non-semver tag', function() {
        const project = createProject({ 'ember-cli': 'git://github.com/stefanpenner/ember-cli.git#master' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a local path', function() {
        const project = createProject({ 'ember-cli': '~/projects/ember-cli' });
        assertNoPackageManagerError(project);
      });

      it('does NOT error with a * dependency', function() {
        const project = createProject({ 'ember-cli': '*' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is found outside the project root', function() {
        const project = createProject({ 'example-package': '1.2.3' }, { root: 'tests/fixtures/outside-root-' + packageManagerName + '-project/project' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a url to a tar.gz  and a _from is provided in the package.json and urls match', function() {
        const project = createProject({ 'example-tar-gz': 'http://ember-cli.com/example-2.0.0.tar.gz' }, { root: 'tests/fixtures/project-'+ packageManagerName + '-tar-gz-check' });
        assertNoPackageManagerError(project);
      });

      it('when the version specified is a url to a tar.gz and a _from is provided in the package.json with the package-name@ prefix and urls match', function() {
        const project = createProject({ 'example-tar-gz': 'http://ember-cli.com/example-2.0.0.tar.gz' }, { root: 'tests/fixtures/project-'+ packageManagerName + '-tar-gz-at-check' });
        assertNoPackageManagerError(project);
      });

      it('when the specified bower package is installed via npm', function() {
        const project = createProject({ '@bower_components/ember': '1.0.0' }, { root: 'tests/fixtures/project-bower-away' });
        assertNoPackageManagerError(project);
      });
    });

    describe('sibling node_modules/ directory', function() {
      it('checks depdencies', function() {
        const project = createProject({
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
