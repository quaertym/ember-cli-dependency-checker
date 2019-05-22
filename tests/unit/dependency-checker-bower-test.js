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

  function createProject(bowerDependencies, npmDependencies = {}) {
    return projectBuilder.build({
      root: 'tests/fixtures/project-bower-check',
      bowerDependencies: projectBuilder.buildBowerDependencies(bowerDependencies),
      dependencies: projectBuilder.buildDependencies(npmDependencies),
    });
  }

  const assertBowerError = function(project) {
    return assertError(project, 'bower');
  };

  const assertNoBowerError = function(project) {
    return assertNoError(project, 'bower');
  };

  describe('reports unsatisfied Bower dependencies', function() {
    it('when the specified package is not installed', function() {
      const project = createProject({ 'foo': '0.1.1', 'ember': '1.7.0' });
      assertBowerError(project);
    });

    it('when the installed package does not match the version specified', function() {
      const project = createProject({ 'ember': '1.8.1' });
      assertBowerError(project);
    });

    it('when the installed package does not satisfy the version range specified', function() {
      const project = createProject({ 'ember': '>1.8.0 <=1.9.0' });
      assertBowerError(project);
    });

    it('when the installed package is not compatible with the version specified', function() {
      const project = createProject({ 'ember': '2.x.x' });
      assertBowerError(project);
    });

    it('when the version specified is a Git repo with a semver tag and there is a version mismatch', function() {
      const project = createProject({ 'ember': 'git://github.com/emberjs/emberjs.git#v1.8.0' });
      assertBowerError(project);
    });

    it('when the version specified is a URL and package is not installed', function() {
      const project = createProject({ 'ember-easyForm': 'http://builds.dockyard.com.s3.amazonaws.com/ember-easyForm/canary/ember-easyForm.js' });
      assertBowerError(project);
    });
  });

  describe('does not report satisfied Bower dependencies', function() {
    it('when the installed package matches the version specified', function() {
      const project = createProject({ 'ember': '1.7.0' });
      assertNoBowerError(project);
    });

    it('when the installed package satisfies the version range specified', function() {
      const project = createProject({ 'ember': '>1.5.0' });
      assertNoBowerError(project);
    });

    it('when the installed package is compatible with the version specified', function() {
      const project = createProject({ 'ember': '^1.7.0' });
      assertNoBowerError(project);
    });

    it('when the version specified is a URL', function() {
      const project = createProject({ 'ember': 'http://emberjs.com/ember.tar.gz' });
      assertNoBowerError(project);
    });

    it('when the version specified is a URL and installed package does not include bower.json and version key in .bower.json', function() {
      const project = createProject({ 'sinon': 'http://sinonjs.org/releases/sinon-1.12.1.js' });
      assertNoBowerError(project);
    });

    it('when the version specified is a Git repo with a non-semver tag', function() {
      const project = createProject({ 'ember': 'git://github.com/emberjs/emberjs.git#master' });
      assertNoBowerError(project);
    });

    it('when the version specified is a local path', function() {
      const project = createProject({ 'ember': '~/projects/emberjs' });
      assertNoBowerError(project);
    });

    it('does NOT error with a * dependency', function() {
      const project = createProject({ 'ember': '*' });
      assertNoBowerError(project);
    });

    it('when the package is installed via yarn or npm', function() {
      const project = createProject({ 'ember': '1.0.0' }, { '@bower_components/ember': '1.0.0' });
      assertNoBowerError(project);
    });
  });
});
