'use strict';

function Package() {
  this.init.apply(this, arguments);
}

Package.prototype = Object.create({});
Package.prototype.constructor = Package;

Package.prototype.init = function(name, versionSpecified, versionInstalled) {
  this.name = name;
  this.versionSpecified = versionSpecified;
  this.versionInstalled = versionInstalled;
  this.needsUpdate = this.updateRequired();
};

Package.prototype.updateRequired = function() {
  if (!this.versionInstalled) {
    return true;
  }

  var version   = this.versionSpecified;
  var isGitRepo = require('./git-repo');
  var semver    = require('semver');

  if (version === '*') {
    return false;
  } else if (isGitRepo(version)) {
    var parts = version.split('#');
    if (parts.length === 2) {
      version = semver.valid(parts[1]);
      if (!version) {
        return false;
      }
    }
  }

  if (!semver.validRange(version)) {
    return false;
  }

  try {
    return !semver.satisfies(this.versionInstalled, version);
  }
  catch (e) {
    var err = new Error('Version check for package ' + this.name + ' failed: ' +
        'semver.satisfies(\'' + this.versionInstalled + '\', \'' +
        version + '\') threw ' + e.message
    );
    err.cause = e;
    throw err;
  }
};

module.exports = Package;
