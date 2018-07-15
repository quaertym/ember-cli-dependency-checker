'use strict';

function Package() {
  this.init.apply(this, arguments);
}

Package.prototype = Object.create({});
Package.prototype.constructor = Package;

Package.prototype.init = function(name, versionSpecified, versionInstalled, path) {
  this.name = name;
  this.path = path;
  this.versionSpecified = versionSpecified;
  this.versionInstalled = versionInstalled;

  try {
    this.needsUpdate = this.updateRequired();
    this.isSymlinked = this.symlinked();
  } catch(e) {
    const versionText = '(version specified: ' + versionSpecified + ', version installed: ' + versionInstalled + '): ';
    e.message = 'Failed processing module "' + name + '" ' + versionText + e.message;
    throw e;
  }
};

Package.prototype.updateRequired = function() {
  const VersionChecker = require('./version-checker');
  return !VersionChecker.satisfies(this.versionSpecified, this.versionInstalled);
};

Package.prototype.symlinked = function() {
  const isSymlink = require('./utils/is-symlink');
  return isSymlink(this.path);
};

module.exports = Package;
