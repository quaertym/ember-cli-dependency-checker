'use strict';

var path = require('path');
var fs = require('fs');

function readFile(path){
  if (fs.existsSync(path)) {
    return fs.readFileSync(path);
  }
}

var ShrinkWrapChecker = function(root, name, version){
  this.root = root;
  this.name = name;
  this.version = version;
};

ShrinkWrapChecker.prototype.check = function() {
  var packageJSON = this.readPackageJSON() || {};

  var packageData = {
    name: this.name,
    versionSpecified: this.version,
    versionInstalled: packageJSON.version
  };

  packageData.needsUpdate = packageData.versionSpecified !== packageData.versionInstalled;
  return packageData;
};

ShrinkWrapChecker.prototype.readPackageJSON = function() {
  var filePath = path.join(this.root, 'package.json');
  try {
    return JSON.parse(readFile(filePath));
  } catch (e) {
    return null;
  }
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
