'use strict';

var path       = require('path');
var fs         = require('fs');
var readFile   = fs.readFileSync;
var fileExists = fs.existsSync;
var Package    = require('./package');

var alreadyChecked = false;

function isUnsatisfied(pkg) {
  return !!pkg.needsUpdate;
}

function EmberCLIDependencyChecker(project) {
  this.name    = 'ember-cli-dependency-checker';
  this.project = project;
  this.checkDependencies();
}

EmberCLIDependencyChecker.prototype.checkDependencies = function() {

  if(alreadyChecked) {
    return;
  }

  var bowerDeps = this.readBowerDependencies();
  var unsatisfiedBowerDeps = bowerDeps.filter(isUnsatisfied);

  var npmDeps = this.readNPMDependencies();
  var unsatisfiedNPMDeps = npmDeps.filter(isUnsatisfied);

  var message = '';
  message += this.reportUnsatisfiedPackages('npm', unsatisfiedNPMDeps);
  message += this.reportUnsatisfiedPackages('bower', unsatisfiedBowerDeps);
  EmberCLIDependencyChecker.setAlreadyChecked(true);

  if (message !== '') {
    var DependencyError = require('./dependency-error');
    throw new DependencyError(message);
  }
};

EmberCLIDependencyChecker.prototype.lookupNodeModuleVersion = function(name) {
  var nodePackage = path.join(this.project.root, 'node_modules', name, 'package.json');
  return this.lookupPackageVersion(nodePackage);
};

EmberCLIDependencyChecker.prototype.lookupBowerPackageVersion = function(name) {
  var dotBowerFile = path.join(this.project.root, this.project.bowerDirectory, name, '.bower.json');
  var version = this.lookupPackageVersion(dotBowerFile);
  if (!version) {
    var bowerFile = path.join(this.project.root, this.project.bowerDirectory, name, 'bower.json');
    version = this.lookupPackageVersion(bowerFile);
    if (version === null) {
        if (fileExists(path.join(this.project.root, this.project.bowerDirectory, name))) {
            version = undefined;
        }
    }
  }
  return version;
};

EmberCLIDependencyChecker.prototype.lookupPackageVersion = function(path) {
  if (fileExists(path)) {
    var pkg = readFile(path);
    var version = null;
    try {
      version = JSON.parse(pkg).version || null;
    } catch(e) {
      // JSON parse error
    }
    return version;
  } else {
    return null;
  }
};

EmberCLIDependencyChecker.prototype.readBowerDependencies = function() {
  var dependencies = this.project.bowerDependencies();

  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupBowerPackageVersion(name);

    if (versionSpecified.substr(0, 7) === 'http://' || versionSpecified.substr(0, 8) === 'https://') {
      versionInstalled = '*';
    }

    if (versionSpecified === '*' && versionInstalled === undefined) {
      versionInstalled = '0.0.0';
    }

    return new Package(name, versionSpecified, versionInstalled);
  }, this);
};

EmberCLIDependencyChecker.prototype.readNPMDependencies = function() {
  var dependencies = this.project.dependencies();

  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupNodeModuleVersion(name);
    return new Package(name, versionSpecified, versionInstalled);
  }, this);
};

EmberCLIDependencyChecker.prototype.reportUnsatisfiedPackages = function(type, packages) {
  this.chalk = this.chalk || require('chalk');
  this.EOL   = this.EOL || require('os').EOL;

  var chalk = this.chalk;
  var EOL   = this.EOL;
  var message = '';
  if (packages.length > 0) {
    message += EOL + chalk.red('Missing ' + type + ' packages: ') + EOL;

    packages.map(function(pkg) {
      message += chalk.reset('Package: ') + chalk.cyan(pkg.name) + EOL;
      message += chalk.grey('  * Specified: ') + chalk.reset(pkg.versionSpecified) + EOL;
      message += chalk.grey('  * Installed: ') + chalk.reset(pkg.versionInstalled || '(not installed)') + EOL + EOL;
    });

    message += chalk.red('Run `'+ type +' install` to install missing dependencies.') + EOL;
  }
  return message;
};

EmberCLIDependencyChecker.setAlreadyChecked = function(value) {
  alreadyChecked = value;
};

module.exports = EmberCLIDependencyChecker;
