'use strict';

class VersionChecker {
  static satisfies(versionSpecified, versionInstalled) {
    if (!versionInstalled) {
      return false;
    }

    let version   = versionSpecified;
    const isGitRepo = require('is-git-url');
    const semver    = require('semver');

    if (version === '*') {
      return true;
    } else if (isGitRepo(version)) {
      const parts = version.split('#');
      if (parts.length === 2) {
        version = semver.valid(parts[1]);
        if (!version) {
          return true;
        }
      }
    }

    if (!semver.validRange(version)) {
      return true;
    }

    return semver.satisfies(versionInstalled, version);
  }
}

module.exports = VersionChecker;
