'use strict';

var readPackageJSON = require('./utils/read-package-json');
var Package = require('./package');
var path = require('path');

var ShrinkWrapChecker = function(root, name, versionSpecified){
  this.root = root;
  this.name = name;
  this.versionSpecified = versionSpecified;
};

ShrinkWrapChecker.prototype.check = function() {
  var packageJSON = readPackageJSON(this.root) || {};
  var versionInstalled = packageJSON.version,
      strictVersionCheck = true;

  return new Package(
    this.name, this.versionSpecified, versionInstalled, strictVersionCheck);
};

ShrinkWrapChecker.checkDependencies = function(root, shrinkWrapJSON) {
  var resolvedDependencies = [];
  var currentNode;

  var nodesToCheck = [{
    root: root,
    childDependencies: shrinkWrapJSON.dependencies,
    name: shrinkWrapJSON.name,
    version: shrinkWrapJSON.version
  }];

  var checker, resolved;

  while (currentNode = nodesToCheck.pop()) {
    checker = new ShrinkWrapChecker(
      currentNode.root, currentNode.name, currentNode.version);

    resolved = checker.check();
    resolvedDependencies.push(resolved);

    if (!resolved.needsUpdate) {
      /* jshint loopfunc:true*/
      Object.keys(currentNode.childDependencies).forEach(function(childDepName){
        var childDep = currentNode.childDependencies[childDepName];

        nodesToCheck.push({
          root: path.join(currentNode.root, 'node_modules', childDepName),
          name: childDepName,
          childDependencies: childDep.dependencies,
          version: childDep.version
        });
      });
    }
  }

  return resolvedDependencies;
};

module.exports = ShrinkWrapChecker;
