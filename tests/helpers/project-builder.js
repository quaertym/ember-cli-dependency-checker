'use strict';

const resolve = require('resolve');

let defaultProject, projectBuilder;

function simpleMerge(target, object) {
  const merged = Object.create(target);
  for (const key in object) {
    merged[key] = object[key];
  }
  return merged;
}

/*
 * Usage:
 *
 * const project = projectBuilder.build({
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
    const project = simpleMerge(defaultProject, configuredProject || {});
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
  dependencies: projectBuilder.buildDependencies(),
  bowerDependencies: projectBuilder.buildBowerDependencies(),

  resolveSync(path) {
    return resolve.sync(path, { basedir: this.root });
  }
};

module.exports = projectBuilder;
