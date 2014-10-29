'use strict';

var path       = require('path');
var semver     = require('semver');
var chalk      = require('chalk');
var EOL        = require('os').EOL;
var fs         = require('fs');
var readFile   = fs.readFileSync;
var fileExists = fs.existsSync;

function EmberCLIDependencyChecker(project) {
  this.name    = 'ember-cli-dependency-checker';
  this.project = project;
  this.checkDependencies();
}

EmberCLIDependencyChecker.prototype.checkDependencies = function() {

  var isUnsatisfied = function(pkg) {
    return !!pkg.needsUpdate;
  };

  var bowerDeps = this.readBowerDependencies();
  var unsatisfiedBowerDeps = bowerDeps.filter(isUnsatisfied);

  var npmDeps = this.readNPMDependencies();
  var unsatisfiedNPMDeps = npmDeps.filter(isUnsatisfied);

  var message = '';
  message += this.reportUnsatisfiedPackages('npm', unsatisfiedNPMDeps);
  message += this.reportUnsatisfiedPackages('bower', unsatisfiedBowerDeps);

  if(message !== '') {
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
  if(!version) {
    var bowerFile = path.join(this.project.root, this.project.bowerDirectory, name, 'bower.json');
    version = this.lookupPackageVersion(bowerFile);
  }
  return version;
};

EmberCLIDependencyChecker.prototype.lookupPackageVersion = function(path) {
  if(fileExists(path)) {
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

EmberCLIDependencyChecker.prototype.updateRequired = function(name, version, versionInstalled) {
  if (!versionInstalled) {
    return true;
  }

  var isGitRepo = function(str) {
    return (/^git(\+(ssh|https?))?:\/\//i).test(str) || (/\.git\/?$/i).test(str) || (/^git@/i).test(str);
  };

  if (isGitRepo(version)) {
    var parts = version.split('#');
    if (parts.length === 2) {
      version = this.semver.valid(parts[1]);
      if (!version) {
        return false;
      }
    }
  }

  if (!semver.validRange(version)) {
    return false;
  }

  return !semver.satisfies(versionInstalled, version);
};

EmberCLIDependencyChecker.prototype.readBowerDependencies = function() {
  var bowerFilePath = path.join(this.project.root, 'bower.json');
  var bowerFileContents = fs.readFileSync(bowerFilePath);
  var dependencies = JSON.parse(bowerFileContents).dependencies;
  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupBowerPackageVersion(name);
    return this.resolvePackage(name, versionSpecified, versionInstalled);
  }, this);
};

EmberCLIDependencyChecker.prototype.readNPMDependencies = function() {
  var dependencies = this.project.dependencies();
  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupNodeModuleVersion(name);
    return this.resolvePackage(name, versionSpecified, versionInstalled);
  }, this);
};

EmberCLIDependencyChecker.prototype.resolvePackage = function(name, versionSpecified, versionInstalled) {
  return {
    name: name,
    versionSpecified: versionSpecified,
    versionInstalled: versionInstalled,
    needsUpdate: this.updateRequired(name, versionSpecified, versionInstalled)
  };
};

EmberCLIDependencyChecker.prototype.reportUnsatisfiedPackages = function(type, packages) {
  var message = '';
  if(packages.length > 0) {
    message += EOL + chalk.red('Missing ' + type + ' packages: ') + EOL;

    packages.map(function(pkg) {
      message += chalk.green('Package: ') + chalk.cyan(pkg.name) + EOL;
      message += chalk.grey('  * Specified: ') + chalk.green(pkg.versionSpecified) + EOL;
      message += chalk.grey('  * Installed: ') + chalk.green(pkg.versionInstalled || '(not installed)') + EOL + EOL;
    }, this);

    message += chalk.red('Run `'+ type +' install` to install missing dependencies.') + EOL;
  }
  return message;
};

function DependencyError(message) {
  this.name     = 'DependencyError';
  this.message  = message;

  if (process.env.EMBER_VERBOSE_ERRORS === 'true') {
    this.stack = (new Error()).stack;
    this.suppressStacktrace = false;
  } else {
    this.suppressStacktrace = true;
  }
}

DependencyError.prototype = Error.prototype;
DependencyError.prototype.constructor = DependencyError;

module.exports = EmberCLIDependencyChecker;
