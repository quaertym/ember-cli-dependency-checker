'use strict';

const path       = require('path');
const resolve = require('resolve');
const fs         = require('fs');
const findYarnWorkspaceRoot = require('find-yarn-workspace-root');
const readFile   = fs.readFileSync;
const readDir    = fs.readdirSync;
const fileExists = fs.existsSync;
const Package    = require('./package');
const buildBowerPackagePath = require('./utils/build-bower-package-path');
const isTarGz    = require('./utils/is-tar-gz');
const unknownVersion = require('./utils/unknown-version');

let alreadyChecked = false;

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

  const bowerDeps = this.readBowerDependencies();
  this.reporter.unsatisifedPackages('bower', bowerDeps.filter(isUnsatisfied));

  const npmDeps = this.readNPMDependencies();
  const filteredDeps = npmDeps.filter(isUnsatisfied);
  const unsatisfiedDeps = filteredDeps.filter(isNotSymlinked);
  const symlinkedDeps = filteredDeps.filter(isSymlinked);

  const yarnPath = path.join(this.project.root, 'yarn.lock');
  const yarnWorkspacePath = findYarnWorkspaceRoot(this.project.root);

  let packageManagerName = 'npm';
  if (fileExists(yarnPath) || yarnWorkspacePath) {
    packageManagerName = 'yarn';
  }

  this.reporter.reportUnsatisfiedSymlinkedPackages(packageManagerName, symlinkedDeps);
  this.reporter.unsatisifedPackages(packageManagerName, unsatisfiedDeps);

  if (unsatisfiedDeps.length === 0) {
    const shrinkWrapDeps = this.readShrinkwrapDeps();
    this.reporter.unsatisifedPackages('npm-shrinkwrap', shrinkWrapDeps.filter(isUnsatisfied));
  }

  EmberCLIDependencyChecker.setAlreadyChecked(true);

  this.reporter.report();
};

EmberCLIDependencyChecker.prototype.readShrinkwrapDeps = function() {
  const filePath = path.join(this.project.root, 'npm-shrinkwrap.json');
  if (fileExists(filePath)) {
    const ShrinkWrapChecker = require('./shrinkwrap-checker');
    const shrinkWrapBody = readFile(filePath);
    let shrinkWrapJSON = {};
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
    const nodePackage = resolve.sync(path.join(name, 'package.json'), { basedir: this.project.root });
    const version = this.lookupPackageVersion(nodePackage, versionSpecified);
    return { version: version, path: path.dirname(nodePackage) };
  } catch(err) {
    return { version: null, path: null };
  }
};

EmberCLIDependencyChecker.prototype.lookupBowerPackageVersion = function(name) {
  const packageDirectory = path.resolve(this.project.root, this.project.bowerDirectory, name);
  let version = null;
  if (fileExists(packageDirectory) && readDir(packageDirectory).length > 0) {
    const dotBowerFile = path.join(packageDirectory, '.bower.json');
    version = this.lookupPackageVersion(dotBowerFile);
    if (!version) {
      const bowerFile = path.join(packageDirectory, 'bower.json');
      version = this.lookupPackageVersion(bowerFile) || '*';
    }
  }
  return version;
};

EmberCLIDependencyChecker.prototype.lookupPackageVersion = function(path, versionSpecified) {
  if (fileExists(path)) {
    const pkg = readFile(path);
    let version = null;
    try {
      const pkgContent = JSON.parse(pkg);
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
    const versionSpecified = dependencies[name];
    if (type === 'npm') {
      const result = this.lookupNodeModule(name, versionSpecified);
      return new Package(name, versionSpecified, result.version, result.path);
    } else {
      let versionInstalled = this.lookupBowerPackageVersion(name);
      if (isTarGz(versionSpecified)) {
        versionInstalled = unknownVersion;
      }
      const path = buildBowerPackagePath(this.project, name);
      return new Package(name, versionSpecified, versionInstalled, path);
    }
  }, this);
};

EmberCLIDependencyChecker.setAlreadyChecked = function(value) {
  alreadyChecked = value;
};

module.exports = EmberCLIDependencyChecker;
