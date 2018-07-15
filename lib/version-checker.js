'use strict';

function VersionChecker() {
}

VersionChecker.satisfies = function(versionSpecified, versionInstalled) {
  if (!versionInstalled) {
    return false;
  }

  var version   = versionSpecified;
  var isGitRepo = require('is-git-url');
  var semver    = require('semver');
  var isTarGz   = require('./utils/is-tar-gz');
  var unknownVersion = require('./utils/unknown-version');

  if (version === '*') {
    return true;
  } else if (isGitRepo(version)) {
    var parts = version.split('#');
    if (parts.length === 2) {
      version = semver.valid(parts[1]);
      if (!version) {
        return true;
      }
    }
  } else if (isTarGz(version) && versionInstalled !== unknownVersion) {
    const resolve = require('path').resolve;
    return resolve(version) === resolve(versionInstalled);
  }

  if (!semver.validRange(version)) {
    return true;
  }

  return semver.satisfies(versionInstalled, version);
};

module.exports = VersionChecker;
