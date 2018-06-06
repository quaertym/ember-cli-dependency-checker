'use strict';

var path       = require('path');
var resolve = require('resolve');
var fs         = require('fs');
var findYarnWorkspaceRoot = require('find-yarn-workspace-root');
var readFile   = fs.readFileSync;
var readDir    = fs.readdirSync;
var fileExists = fs.existsSync;
var Package    = require('./package');
var buildBowerPackagePath = require('./utils/build-bower-package-path');
var isTarGz    = require('./utils/is-tar-gz');
var unknownVersion = require('./utils/unknown-version');

var alreadyChecked = false;

function isUnsatisfied(pkg) {
  return !!pkg.needsUpdate;
}

function isSymlinked(pkg) {
  return !!pkg.isSymlinked;
}

function isNotSymlinked(pkg) {
  return !pkg.isSymlinked;
}

function isDisabled(project) {
  return project && project.cli && project.cli.disableDependencyChecker;
}

function EmberCLIDependencyChecker(project, reporter) {
  this.project = project;
  this.reporter = reporter;
}

EmberCLIDependencyChecker.prototype.checkDependencies = function() {
  if (alreadyChecked || process.env.SKIP_DEPENDENCY_CHECKER || isDisabled(this.project)) {
    return;
  }

  var bowerDeps = this.readBowerDependencies();
  this.reporter.unsatisifedPackages('bower', bowerDeps.filter(isUnsatisfied));

  var npmDeps = this.readNPMDependencies();
  var filteredDeps = npmDeps.filter(isUnsatisfied);
  var unsatisfiedDeps = filteredDeps.filter(isNotSymlinked);
  var symlinkedDeps = filteredDeps.filter(isSymlinked);

  var yarnPath = path.join(this.project.root, 'yarn.lock');
  var yarnWorkspacePath = findYarnWorkspaceRoot(this.project.root);

  var packageManagerName = 'npm';
  if (fileExists(yarnPath) || yarnWorkspacePath) {
    packageManagerName = 'yarn';
  }

  this.reporter.reportUnsatisfiedSymlinkedPackages(packageManagerName, symlinkedDeps);
  this.reporter.unsatisifedPackages(packageManagerName, unsatisfiedDeps);

  if (unsatisfiedDeps.length === 0) {
    var shrinkWrapDeps = this.readShrinkwrapDeps();
    this.reporter.unsatisifedPackages('npm-shrinkwrap', shrinkWrapDeps.filter(isUnsatisfied));
  }

  EmberCLIDependencyChecker.setAlreadyChecked(true);

  this.reporter.report();
};

EmberCLIDependencyChecker.prototype.readShrinkwrapDeps = function() {
  var filePath = path.join(this.project.root, 'npm-shrinkwrap.json');
  if (fileExists(filePath)) {
    var ShrinkWrapChecker = require('./shrinkwrap-checker');
    var shrinkWrapBody = readFile(filePath);
    var shrinkWrapJSON = {};
    try {
      shrinkWrapJSON = JSON.parse(shrinkWrapBody);
    } catch(e) {
      // JSON parse error
    }
    return ShrinkWrapChecker.checkDependencies(this.project.root, shrinkWrapJSON);
  } else {
    return [];
  }
};

EmberCLIDependencyChecker.prototype.lookupNodeModule = function(name, versionSpecified) {
  try {
    var nodePackage = resolve.sync(path.join(name, 'package.json'), { basedir: this.project.root });
    var version = this.lookupPackageVersion(nodePackage, versionSpecified);
    return { version: version, path: path.dirname(nodePackage) };
  } catch(err) {
    return { version: null, path: null };
  }
};

EmberCLIDependencyChecker.prototype.lookupBowerPackageVersion = function(name) {
  var packageDirectory = path.resolve(this.project.root, this.project.bowerDirectory, name);
  var version = null;
  if (fileExists(packageDirectory) && readDir(packageDirectory).length > 0) {
    var dotBowerFile = path.join(packageDirectory, '.bower.json');
    version = this.lookupPackageVersion(dotBowerFile);
    if (!version) {
      var bowerFile = path.join(packageDirectory, 'bower.json');
      version = this.lookupPackageVersion(bowerFile) || '*';
    }
  }
  return version;
};

EmberCLIDependencyChecker.prototype.lookupPackageVersion = function(path, versionSpecified) {
  if (fileExists(path)) {
    var pkg = readFile(path);
    var version = null;
    try {
      var pkgContent = JSON.parse(pkg);
      version = pkgContent.version || null;
      if (isTarGz(versionSpecified)) {
        version = pkgContent._from || unknownVersion;
      }
    } catch(e) {
      // JSON parse error
    }
    return version;
  } else {
    return null;
  }
};

EmberCLIDependencyChecker.prototype.readBowerDependencies = function() {
  return this.readDependencies(this.project.bowerDependencies(), 'bower');
};

EmberCLIDependencyChecker.prototype.readNPMDependencies = function() {
  return this.readDependencies(this.project.dependencies(), 'npm');
};

EmberCLIDependencyChecker.prototype.readDependencies = function(dependencies, type) {
  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    if (type === 'npm') {
      var result = this.lookupNodeModule(name, versionSpecified);
      return new Package(name, versionSpecified, result.version, result.path);
    } else {
      var versionInstalled = this.lookupBowerPackageVersion(name);
      if (isTarGz(versionSpecified)) {
        versionInstalled = unknownVersion;
      }
      var path = buildBowerPackagePath(this.project, name);
      return new Package(name, versionSpecified, versionInstalled, path);
    }
  }, this);
};

EmberCLIDependencyChecker.setAlreadyChecked = function(value) {
  alreadyChecked = value;
};

module.exports = EmberCLIDependencyChecker;
