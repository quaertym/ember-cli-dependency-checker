'use strict';

var Package = require('./package');

function ShrinkwrapPackage(name, versionSpecified, versionInstalled, resolvedInstalled, parents) {
  this._super$init.call(this, name, versionSpecified, versionInstalled);
  this.init(name, versionSpecified, versionInstalled, resolvedInstalled, parents);
}

ShrinkwrapPackage.prototype = Object.create(Package.prototype);
ShrinkwrapPackage.prototype.constructor = ShrinkwrapPackage;

ShrinkwrapPackage.prototype._super$init = Package.prototype.init;
ShrinkwrapPackage.prototype.init = function(name, versionSpecified, versionInstalled, resolvedInstalled, parents) {
  this.resolvedInstalled = resolvedInstalled;
  this.parents = parents;

  if (this.needsUpdate && this.resolvedInstalled) {
    this.needsUpdate = this.versionSpecified !== this.resolvedInstalled;
  }
};

ShrinkwrapPackage.prototype.updateRequired = function() {
  return this.versionSpecified !== this.versionInstalled;
};

module.exports = ShrinkwrapPackage;
