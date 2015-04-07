'use strict';

var path          = require('path');
var assertError   = require('../helpers/assert-error');
var assertNoError = require('../helpers/assert-no-error');
var DependencyError   = require('../../lib/dependency-error');
var assert            = require('chai').assert;
var DependencyChecker = require('../../lib/dependency-checker');
var Reporter          = require('../../lib/reporter');

describe('EmberCLIDependencyChecker : Shrinkwrap', function() {
  beforeEach(function(){
    DependencyChecker.setAlreadyChecked(false);
  });

  var createProject = function(dependencies, root) {
    var rootPath = root || 'tests/fixtures/project-shrinkwrap-check';
    return {
      root: rootPath,
      bowerDirectory: 'bower_components',
      nodeModulesPath: path.join(rootPath, 'node_modules'),
      dependencies: function() {
        return dependencies || {};
      },
      bowerDependencies: function() {
        return {};
      }
    };
  };

  describe('with a shrinkwrap file', function() {
    describe('with top-level dependencies that are not satisifed', function() {
      it('throws npm error but not npm-shrinkwrap error', function() {
        var project = createProject({
          minimist: '^1.1.1'
        });

        var checker = new DependencyChecker(project, new Reporter());
        var errorMsg;
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
        var project = createProject({
          minimist: '^1.0.0'
        });

        var checker = new DependencyChecker(project, new Reporter());
        var errorMsg;
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
        var project = createProject({
          'mkdirp': '0.5.0'
        }, 'tests/fixtures/project-shrinkwrap-nested-deps-check');

        assertError(project, 'npm-shrinkwrap');
      });
    });
  });

  describe('does not report unsatisfied npm-shrinkwrap dependencies', function() {
    it('when top-level deps and nested deps are satisfied', function() {
      var project = createProject({
        'mkdirp': '0.5.0'
      }, 'tests/fixtures/project-shrinkwrap-nested-deps-ok');

      assertNoError(project, 'npm-shrinkwrap');
    });
  });
});
