'use strict';

var readPackageJSON = require('./utils/read-package-json');
var ShrinkwrapPackage = require('./shrinkwrap-package');
var path = require('path');

var ShrinkwrapChecker = function(root, name, versionSpecified, parents){
  this.root = root;
  this.name = name;
  this.versionSpecified = versionSpecified;
  this.parents = parents;
};

ShrinkwrapChecker.prototype.check = function() {
  var packageJSON = readPackageJSON(this.root) || {};
  var versionInstalled = packageJSON.version;

  return new ShrinkwrapPackage(
    this.name, this.versionSpecified, versionInstalled, this.parents);
};

ShrinkwrapChecker.checkDependencies = function(root, shrinkWrapJSON) {
  var resolvedDependencies = [];
  var currentNode;

  var nodesToCheck = [{
    root: root,
    parents: [],
    childDependencies: shrinkWrapJSON.dependencies,
    name: shrinkWrapJSON.name,
    version: shrinkWrapJSON.version
  }];

  var checker, resolved;

  while (currentNode = nodesToCheck.pop()) {
    checker = new ShrinkwrapChecker(
      currentNode.root, currentNode.name, currentNode.version, currentNode.parents);

    resolved = checker.check();
    resolvedDependencies.push(resolved);

    if (!resolved.needsUpdate && currentNode.childDependencies) {
      /* jshint loopfunc:true*/
      var parents = currentNode.parents.concat(currentNode.name);
      Object.keys(currentNode.childDependencies).forEach(function(childDepName){
        var childDep = currentNode.childDependencies[childDepName];

        nodesToCheck.push({
          root: path.join(currentNode.root, 'node_modules', childDepName),
          parents: parents,
          name: childDepName,
          childDependencies: childDep.dependencies,
          version: childDep.version
        });
      });
    }
  }

  return resolvedDependencies;
};

module.exports = ShrinkwrapChecker;
