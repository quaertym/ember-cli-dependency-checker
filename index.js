'use strict';

var path = require('path');
var fs   = require('fs');
var sys  = require('sys');
var EOL  = require('os').EOL;

module.exports = {
  name: 'ember-cli-dependency-checker',
  included: function(app) {
    this._super.included.apply(this, arguments);

    var bowerDeps = this.readBowerFileDependencies(app);
    var bowerDirectoryContents = this.readBowerDirectoryContents(app);
    var missingBowerDeps = this.diff(bowerDeps, bowerDirectoryContents);

    var pkgDeps = this.readPackageFileDependencies(app);
    var modulesDirectoryContents = this.readModulesDirectoryContents(app);
    var missingNodeDeps = this.diff(pkgDeps, modulesDirectoryContents);

    this.printMissingDependencies('bower', missingBowerDeps);
    this.printMissingDependencies('npm', missingNodeDeps);
  },
  readModulesDirectoryContents: function(app) {
    var modulesDirectory = path.join(app.project.root, 'node_modules');
    return fs.readdirSync(modulesDirectory);
  },
  readBowerDirectoryContents: function(app) {
    var bowerDirectory = path.join(app.project.root, app.bowerDirectory);
    return fs.readdirSync(bowerDirectory);
  },
  readBowerFileDependencies: function(app) {
    var bowerFilePath = path.join(app.project.root, 'bower.json');
    var bowerFileContents = fs.readFileSync(bowerFilePath);
    var bower = JSON.parse(bowerFileContents);
    return Object.keys(bower.dependencies);
  },
  readPackageFileDependencies: function(app) {
    return Object.keys(app.project.dependencies());
  },
  printMissingDependencies: function(type, dependencies) {
    if(dependencies.length > 0) {
      sys.print(EOL + 'Missing ' + type + ' dependencies: ' + EOL);
      dependencies.forEach(function(name) {
        sys.print('\t' + name + EOL);
      });
      sys.print(EOL);
    }
  },
  diff: function(first, second) {
    return first.filter(function(i) {
      return second.indexOf(i) < 0;
    });
  }
};
