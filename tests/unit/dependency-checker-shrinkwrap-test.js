/* eslint-env node, mocha */
'use strict';

const assertError   = require('../helpers/assert-error');
const assertNoError = require('../helpers/assert-no-error');
const DependencyError   = require('../../lib/dependency-error');
const assert            = require('chai').assert;
const DependencyChecker = require('../../lib/dependency-checker');
const Reporter          = require('../../lib/reporter');
const projectBuilder = require('../helpers/project-builder');

describe('EmberCLIDependencyChecker : Shrinkwrap', function() {
  beforeEach(function(){
    DependencyChecker.setAlreadyChecked(false);
  });

  function createProject(dependencies, options) {
    options = options || {};
    options.root = options.root || 'tests/fixtures/project-shrinkwrap-check';
    options.dependencies = projectBuilder.buildDependencies(dependencies);
    return projectBuilder.build(options);
  }

  describe('with a shrinkwrap file', function() {
    describe('with top-level dependencies that are not satisifed', function() {
      it('throws npm error but not npm-shrinkwrap error', function() {
        const project = createProject({
          minimist: '^1.1.1'
        });

        const checker = new DependencyChecker(project, new Reporter());
        let errorMsg;
        try {
          checker.checkDependencies();
        } catch (e) {
          errorMsg = e;
        }

        assert.ok(errorMsg instanceof DependencyError, 'throws a DependencyError');
        assert.ok(errorMsg.message.indexOf('Missing npm packages') > -1,
                  'misses npm packages');
        assert.ok(errorMsg.message.indexOf('Missing npm-shrinkwrap packages') === -1,
                  'does not miss npm-shrinkwrap packages');
      });

      it('throws npm-shrinkwrap error if dependency is met by package.json but not by shrinkwrap', function() {
        const project = createProject({
          minimist: '^1.0.0'
        });

        const checker = new DependencyChecker(project, new Reporter());
        let errorMsg;
        try {
          checker.checkDependencies();
        } catch (e) {
          errorMsg = e;
        }

        assert.ok(errorMsg instanceof DependencyError, 'throws a DependencyError');
        assert.ok(errorMsg.message.indexOf('Missing npm-shrinkwrap packages') > -1,
                  'misses npm-shrinkwrap packages');
        assert.ok(errorMsg.message.indexOf('Missing npm packages') === -1,
                  'does not miss npm packages');
      });
    });

    describe('when top-level deps are satisfied but nested deps are not', function() {
      it('when the installed package does not match the version specified', function() {
        const project = createProject({
          'mkdirp': '0.5.0'
        }, {
          root: 'tests/fixtures/project-shrinkwrap-nested-deps-check'
        });

        assertError(project, 'npm-shrinkwrap');
      });
    });
  });

  describe('does not report satisfied npm-shrinkwrap dependencies', function() {
    it('when top-level deps and nested deps are satisfied', function() {
      const project = createProject({
        'mkdirp': '0.5.0'
      }, {
        root: 'tests/fixtures/project-shrinkwrap-nested-deps-ok'
      });

      assertNoError(project, 'npm-shrinkwrap');
    });
  });

  describe('sibling node_modules/ directory', function() {
    it('checks dependencies', function() {
      const project = createProject({
        'minimist': '1.1.1'
      }, {
        root: 'tests/fixtures/project-shrinkwrap-sibling-node-modules-check/app',
        nodeModulesPath: 'tests/fixtures/project-shrinkwrap-sibling-node-modules-check/node_modules'
      });
      assertNoError(project, 'npm-shrinkwrap');
    });
  });
});
