'use strict';

const path       = require('path');
const resolve = require('resolve');
const fs         = require('fs');
const readFile   = fs.readFileSync;
const readDir    = fs.readdirSync;
const fileExists = fs.existsSync;
const Package    = require('./package');
const buildBowerPackagePath = require('./utils/build-bower-package-path');

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

class EmberCLIDependencyChecker {
  constructor(project, reporter) {
    this.project = project;
    this.reporter = reporter;
  }

  checkDependencies() {
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

    let packageManagerName = 'npm';
    if (fileExists(yarnPath)) {
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
  }

  readShrinkwrapDeps() {
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
  }

  lookupNodeModule(name) {
    try {
      const nodePackage = resolve.sync(path.join(name, 'package.json'), { basedir: this.project.root });
      const version = this.lookupPackageVersion(nodePackage);
      return { version: version, path: path.dirname(nodePackage) };
    } catch(err) {
      return { version: null, path: null };
    }
  }

  lookupBowerPackageVersion(name) {
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
  }

  lookupPackageVersion(path) {
    if (fileExists(path)) {
      const pkg = readFile(path);
      let version = null;
      try {
        version = JSON.parse(pkg).version || null;
      } catch(e) {
        // JSON parse error
      }
      return version;
    } else {
      return null;
    }
  }

  readBowerDependencies() {
    return this.readDependencies(this.project.bowerDependencies(), 'bower');
  }

  readNPMDependencies() {
    return this.readDependencies(this.project.dependencies(), 'npm');
  }

  readDependencies(dependencies, type) {
    return Object.keys(dependencies).map(function(name) {
      const versionSpecified = dependencies[name];
      if (type === 'npm') {
        const result = this.lookupNodeModule(name);
        return new Package(name, versionSpecified, result.version, result.path);
      } else {
        const versionInstalled = this.lookupBowerPackageVersion(name);
        const path = buildBowerPackagePath(this.project, name);
        return new Package(name, versionSpecified, versionInstalled, path);
      }
    }, this);
  }

  static setAlreadyChecked(value) {
    alreadyChecked = value;
  }
}

module.exports = EmberCLIDependencyChecker;
