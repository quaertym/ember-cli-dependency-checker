'use strict';

var readPackageJSON = require('./utils/read-package-json');
var ShrinkwrapPackage = require('./shrinkwrap-package');
var path = require('path');
var resolve = require('resolve');

var ShrinkwrapChecker = function(root, name, versionSpecified, parents, requiredFrom){
  this.root = root;
  this.name = name;
  this.versionSpecified = versionSpecified;
  this.parents = parents;
  this.requiredFrom = requiredFrom;
};

ShrinkwrapChecker.prototype.check = function() {
  if (!this.root) {
    try {
      this.root = path.dirname(resolve.sync(path.join(this.name, 'package.json'), { basedir: this.requiredFrom }));
    } catch(err) {
      // not found
    }
  }
  var packageJSON;
  if (!this.root) {
    packageJSON = {};
  } else {
    packageJSON = readPackageJSON(this.root) || {};
  }

  var versionInstalled = packageJSON.version;
  var resolvedInstalled = packageJSON['_resolved'];

  return new ShrinkwrapPackage(
    this.name, this.versionSpecified, versionInstalled, resolvedInstalled, this.parents);
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

  while ((currentNode = nodesToCheck.pop())) {
    checker = new ShrinkwrapChecker(
      currentNode.root, currentNode.name, currentNode.version, currentNode.parents, currentNode.requiredFrom);

    resolved = checker.check();
    resolvedDependencies.push(resolved);

    if (!resolved.needsUpdate && currentNode.childDependencies) {
      /* jshint loopfunc:true*/
      var parents = currentNode.parents.concat(currentNode.name);
      Object.keys(currentNode.childDependencies).forEach(function(childDepName){
        var childDep = currentNode.childDependencies[childDepName];

        nodesToCheck.push({
          requiredFrom: checker.root,
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
