'use strict';

const Package = require('./package');

class ShrinkwrapPackage extends Package {
  constructor(name, versionSpecified, versionInstalled, resolvedInstalled, parents) {
    super(...arguments);
    this.resolvedInstalled = resolvedInstalled;
    this.parents = parents;

    if (this.needsUpdate && this.resolvedInstalled) {
      this.needsUpdate = this.versionSpecified !== this.resolvedInstalled;
    }
  }

  updateRequired() {
    return this.versionSpecified !== this.versionInstalled;
  }
}

ShrinkwrapPackage.prototype._super$init = Package.prototype.init;

module.exports = ShrinkwrapPackage;
