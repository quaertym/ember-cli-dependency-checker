'use strict';

var path = require('path');
var fs   = require('fs');
var EOL  = require('os').EOL;

var alreadyPrinted = false;

function EmberCLIDependencyChecker(project) {
  this.name    = 'ember-cli-dependency-checker';
  this.project = project;
  this.checkDependencies(project);
}

var diff = function(first, second) {
  return first.filter(function(i) {
    return second.indexOf(i) < 0;
  });
};

EmberCLIDependencyChecker.prototype.checkDependencies = function(project) {
  var bowerDeps = this.readBowerFileDependencies(project);
  var bowerDirectoryContents = this.readBowerDirectoryContents(project);
  var missingBowerDeps = diff(bowerDeps, bowerDirectoryContents);

  var pkgDeps = this.readPackageFileDependencies(project);
  var modulesDirectoryContents = this.readModulesDirectoryContents(project);
  var missingNodeDeps = diff(pkgDeps, modulesDirectoryContents);

  if(!alreadyPrinted) {
    this.printMissingDependencies('bower', missingBowerDeps);
    this.printMissingDependencies('npm', missingNodeDeps);
    alreadyPrinted = true;
  }
};

EmberCLIDependencyChecker.prototype.readModulesDirectoryContents = function(project) {
  var modulesDirectory = path.join(project.root, 'node_modules');
  return fs.readdirSync(modulesDirectory);
};

EmberCLIDependencyChecker.prototype.readBowerDirectoryContents = function(project) {
  var bowerDirectory = path.join(project.root, project.bowerDirectory);
  return fs.readdirSync(bowerDirectory);
};

EmberCLIDependencyChecker.prototype.readBowerFileDependencies = function(project) {
  var bowerFilePath = path.join(project.root, 'bower.json');
  var bowerFileContents = fs.readFileSync(bowerFilePath);
  var bower = JSON.parse(bowerFileContents);
  return Object.keys(bower.dependencies);
};

EmberCLIDependencyChecker.prototype.readPackageFileDependencies = function(project) {
  return Object.keys(project.dependencies());
};

EmberCLIDependencyChecker.prototype.printMissingDependencies = function(type, dependencies) {
  if(dependencies.length > 0) {
    process.stdout.write(EOL + 'Missing ' + type + ' dependencies: ' + EOL);
    dependencies.forEach(function(name) {
      process.stdout.write('\t' + name + EOL);
    });
    process.stdout.write(EOL);
  }
};

module.exports = EmberCLIDependencyChecker;
