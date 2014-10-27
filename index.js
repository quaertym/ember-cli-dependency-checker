'use strict';

var path       = require('path');
var semver     = require('semver');
var chalk      = require('chalk');
var EOL        = require('os').EOL;
var fs         = require('fs');
var readFile   = fs.readFileSync;
var readDir    = fs.readdirSync;
var fileExists = fs.existsSync;

var alreadyPrinted = false;

function EmberCLIDependencyChecker(project) {
  this.name    = 'ember-cli-dependency-checker';
  this.project = project;
  this.checkDependencies(project);
}

EmberCLIDependencyChecker.prototype.checkDependencies = function(project) {

  if(alreadyPrinted) {
    return;
  }

  var isUnsatisfied = function(pkg) {
    return !!pkg.needsUpdate;
  };

  var bowerDeps = this.readBowerDependencies(project);
  var unsatisfiedBowerDeps = bowerDeps.filter(isUnsatisfied);

  var npmDeps = this.readNPMDependencies(project);
  var unsatisfiedNPMDeps = npmDeps.filter(isUnsatisfied);

  this.reportUnsatisfiedPackages('npm', unsatisfiedNPMDeps);
  this.reportUnsatisfiedPackages('bower', unsatisfiedBowerDeps);
  alreadyPrinted = true;
};

EmberCLIDependencyChecker.prototype.lookupNodeModuleVersion = function(project, name) {
  var nodePackage = path.join(project.root, 'node_modules', name, 'package.json');
  return this.lookupPackageVersion(nodePackage);
};

EmberCLIDependencyChecker.prototype.lookupBowerPackageVersion = function(project, name) {
  var bowerFile = path.join(project.root, project.bowerDirectory, name, 'bower.json');
  var version = this.lookupPackageVersion(bowerFile);
  if(!version) {
    var dotBowerFile = path.join(project.root, project.bowerDirectory, name, '.bower.json');
    version = this.lookupPackageVersion(dotBowerFile);
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

EmberCLIDependencyChecker.prototype.readBowerDependencies = function(project) {
  var bowerFilePath = path.join(project.root, 'bower.json');
  var bowerFileContents = fs.readFileSync(bowerFilePath);
  var dependencies = JSON.parse(bowerFileContents).dependencies;
  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupBowerPackageVersion(project, name);
    return this.resolvePackage(name, versionSpecified, versionInstalled);
  }, this);
};

EmberCLIDependencyChecker.prototype.readNPMDependencies = function(project) {
  var dependencies = project.dependencies();
  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupNodeModuleVersion(project, name);
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
}

EmberCLIDependencyChecker.prototype.reportUnsatisfiedPackages = function(type, packages) {
  if(packages.length > 0) {
    this.writeLine('');
    this.writeLine(chalk.red('Missing ' + type + ' packages: '));

    packages.map(function(pkg) {
      this.writeLine('Package: ' + chalk.cyan(pkg.name));
      this.writeLine(chalk.grey('  * Specified: ') + pkg.versionSpecified);
      this.writeLine(chalk.grey('  * Installed: ') + (pkg.versionInstalled || '(not installed)'));
      this.writeLine('');
    }, this);

    this.writeLine(chalk.red('Run `'+ type +' install` to install missing dependencies.'));
    this.writeLine('');
  }
};

EmberCLIDependencyChecker.prototype.writeLine = function(str) {
  process.stdout.write(str + EOL);
}

module.exports = EmberCLIDependencyChecker;
