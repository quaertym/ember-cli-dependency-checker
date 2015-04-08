'use strict';

var defaultProject, projectBuilder;

function simpleMerge(target, object) {
  var merged = Object.create(target);
  for (var key in object) {
    merged[key] = object[key];
  }
  return merged;
}

/*
 * Usage:
 *
 * var project = projectBuilder.build({
 *   dependencies: projectBuilder.buildDependencies([
 *     { some: object }
 *   ],
 *   root: 'some/alternative/root'
 * });
 *
 *
 */
projectBuilder = {

  build: function projectBuilder$build(configuredProject) {
    var project = simpleMerge(defaultProject, configuredProject || {});
    return project;
  },

  buildDependencies: function projectBuilder$buildDependencies(dependencies) {
    return function(){
      return dependencies || {};
    };
  },

  buildBowerDependencies: function projectBuilder$buildBowerDependencies(dependencies) {
    return function(){
      return dependencies || {};
    };
  }
};

defaultProject = {
  root: 'tests/fixtures/project-npm-check',
  bowerDirectory: 'bower_components',
  nodeModulesPath: 'node_modules',
  dependencies: projectBuilder.buildDependencies(),
  bowerDependencies: projectBuilder.buildBowerDependencies()
};

module.exports = projectBuilder;
