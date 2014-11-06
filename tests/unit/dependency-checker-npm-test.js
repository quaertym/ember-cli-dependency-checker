'use strict';

var assertError   = require('../helpers/assert-error');
var assertNoError = require('../helpers/assert-no-error');

describe('EmberCLIDependencyChecker', function() {
  var createProject = function(dependencies) {
    return {
      root: 'tests/fixtures/project-npm-check',
      bowerDirectory: 'bower_components',
      dependencies: function() {
        return dependencies || {};
      },
      bowerDependencies: function() {
        return {};
      }
    };
  };

  var assertNpmError = function(project) {
    return assertError(project, 'npm');
  };

  var assertNoNpmError = function(project) {
    return assertNoError(project, 'npm');
  };

  describe('reports unsatisfied NPM dependencies', function() {
    it('when the specified package is not installed', function() {
      var project = createProject({ 'foo': '0.1.1', 'ember-cli': '1.2.3' });
      assertNpmError(project);
    });

    it('when the installed package does not match the version specified', function() {
      var project = createProject({ 'ember-cli': '0.1.1' });
      assertNpmError(project);
    });

    it('when the installed package does not satisfy the version range specified', function() {
      var project = createProject({ 'ember-cli': '>1.3.2 <=2.3.4' });
      assertNpmError(project);
    });

    it('when the installed package is not compatible with the version specified', function() {
      var project = createProject({ 'ember-cli': '0.2.x' });
      assertNpmError(project);
    });

    it('when the version specified is a Git repo with a semver tag and there is a version mismatch', function() {
      var project = createProject({ 'ember-cli': 'git://github.com/stefanpenner/ember-cli.git#v0.1.0' });
      assertNpmError(project);
    });
  });

  describe('does not report unsatisfied NPM dependencies', function() {
    it('when the installed package matches the version specified', function() {
      var project = createProject({ 'ember-cli': '1.2.3' });
      assertNoNpmError(project);
    });

    it('when the installed package satisfies the version range specified', function() {
      var project = createProject({ 'ember-cli': '>1.0.0' });
      assertNoNpmError(project);
    });

    it('when the installed package is compatible with the version specified', function() {
      var project = createProject({ 'ember-cli': '^1.2.0' });
      assertNoNpmError(project);
    });

    it('when the version specified is a URL', function() {
      var project = createProject({ 'ember-cli': 'http://ember-cli.com/ember-cli.tar.gz' });
      assertNoNpmError(project);
    });

    it('when the version specified is a Git repo with a non-semver tag', function() {
      var project = createProject({ 'ember-cli': 'git://github.com/stefanpenner/ember-cli.git#master' });
      assertNoNpmError(project);
    });

    it('when the version specified is a local path', function() {
      var project = createProject({ 'ember-cli': '~/projects/ember-cli' });
      assertNoNpmError(project);
    });
  });
});
