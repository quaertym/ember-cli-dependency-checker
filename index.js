'use strict';

var path       = require('path');
var semver     = require('semver');
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

// var diff = function(first, second) {
//   return first.filter(function(i) {
//     return second.indexOf(i) < 0;
//   });
// };

EmberCLIDependencyChecker.prototype.checkDependencies = function(project) {

  if(alreadyPrinted) {
    return;
  }

  var isUnsatisfied = function(pkg) {
    return !!pkg.needsUpdate;
  };

  var bowerDeps = this.readBowerDependencies(project);
  var unsatisfiedBowerDeps = bowerDeps.filter(isUnsatisfied);
  console.log(unsatisfiedBowerDeps);

  var npmDeps = this.readNPMDependencies(project);
  var unsatisfiedNPMDeps = npmDeps.filter(isUnsatisfied);
  console.log(unsatisfiedNPMDeps);
  // var bowerDirectoryContents = this.readBowerDirectoryContents(project);
  // var missingBowerDeps = diff(bowerDeps, bowerDirectoryContents);

  // var pkgDeps = this.readPackageFileDependencies(project);
  // var modulesDirectoryContents = this.readModulesDirectoryContents(project);
  // var missingNodeDeps = diff(pkgDeps, modulesDirectoryContents);

  // this.printMissingDependencies('bower', missingBowerDeps);
  // this.printMissingDependencies('npm', missingNodeDeps);
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

  if (this.isGitRepo(version)) {
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

EmberCLIDependencyChecker.prototype.isGitRepo = function(str) {
  return (/^git(\+(ssh|https?))?:\/\//i).test(str) || (/\.git\/?$/i).test(str) || (/^git@/i).test(str);
};

EmberCLIDependencyChecker.prototype.readModulesDirectoryContents = function(project) {
  var modulesDirectory = path.join(project.root, 'node_modules');
  return readDir(modulesDirectory);
};

EmberCLIDependencyChecker.prototype.readBowerDirectoryContents = function(project) {
  var bowerDirectory = path.join(project.root, project.bowerDirectory);
  var packages = readDir(bowerDirectory).map(function(name) {
    return {
      name: name,
      version: this.lookupBowerPackageVersion(project, name)
    };
  }, this);
  return packages;
};

EmberCLIDependencyChecker.prototype.readBowerDependencies = function(project) {
  var bowerFilePath = path.join(project.root, 'bower.json');
  var bowerFileContents = fs.readFileSync(bowerFilePath);
  var dependencies = JSON.parse(bowerFileContents).dependencies;
  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupBowerPackageVersion(project, name);
    return {
      name: name,
      versionSpecified: versionSpecified,
      versionInstalled: versionInstalled,
      needsUpdate: this.updateRequired(name, versionSpecified, versionInstalled)
    };
  }, this);
};

EmberCLIDependencyChecker.prototype.readNPMDependencies = function(project) {
  var dependencies = project.dependencies();
  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupNodeModuleVersion(project, name);
    return {
      name: name,
      versionSpecified: versionSpecified,
      versionInstalled: versionInstalled,
      needsUpdate: this.updateRequired(name, versionSpecified, versionInstalled)
    };
  }, this);
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
