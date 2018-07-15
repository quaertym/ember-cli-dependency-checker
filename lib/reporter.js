'use strict';
var versionChecker = require('./version-checker');

function installCommand(type) {
  switch (type) {
  case 'npm':
    return 'npm install';
  case 'yarn':
    return 'yarn';
  case 'npm-shrinkwrap':
    // npm v3.9.1 included a fix for the bug which makes the rm -rf node_modules
    // necessary ( https://github.com/npm/npm/issues/12372 ), but also exposed
    // a different bug which was fixed in npm v3.9.2
    // ( https://github.com/npm/npm/pull/12724 )
    if (versionChecker.satisfies('>=3.9.2', getNpmVersion())) {
      return 'npm install';
    }
    return 'rm -rf node_modules/ && npm install';
  case 'bower':
    return 'bower install';
  }
}

function getNpmVersion() {
  try {
    return require('child_process').execSync('npm -v').toString();
  } catch (e) {
  }
  return undefined;
}

var Reporter = function() {
  this.messages = [];
};

Reporter.prototype.unsatisifedPackages = function(type, packages) {
  this.chalk = this.chalk || require('chalk');
  this.EOL   = this.EOL || require('os').EOL;

  var chalk = this.chalk;
  var EOL   = this.EOL;

  if (packages.length > 0) {
    var message = '';
    message += EOL + chalk.red('Missing ' + type + ' packages: ') + EOL;

    packages.forEach(function(pkg) {
      message += chalk.reset('Package: ') + chalk.cyan(pkg.name) + EOL;
      if (pkg.parents) {
        message += chalk.reset('Required by: ') + chalk.cyan(pkg.parents.join(' / ')) + EOL;
      }
      message += chalk.grey('  * Specified: ') + chalk.reset(pkg.versionSpecified) + EOL;
      message += chalk.grey('  * Installed: ') + chalk.reset(pkg.versionInstalled || '(not installed)') + EOL + EOL;
    });

    message += chalk.red('Run `'+ installCommand(type) +'` to install missing dependencies.') + EOL;
    this.messages.push(message);
  }
};

Reporter.prototype.reportUnsatisfiedSymlinkedPackages = function(type, packages) {
  this.chalk = this.chalk || require('chalk');
  this.EOL   = this.EOL || require('os').EOL;

  var chalk = this.chalk;
  var EOL   = this.EOL;

  if (packages.length > 0) {
    var message = '';
    message += EOL + chalk.yellow('Missing symlinked ' + type + ' packages: ') + EOL;
    packages.forEach(function(pkg) {
      message += chalk.reset('Package: ') + chalk.cyan(pkg.name) + EOL;
      message += chalk.grey('  * Specified: ') + chalk.reset(pkg.versionSpecified) + EOL;
      message += chalk.grey('  * Symlinked: ') + chalk.reset(pkg.versionInstalled || '(not available)') + EOL + EOL;
    });
    process.stdout.write(message);
  }
};

Reporter.prototype.report = function() {
  if (this.messages.length) {
    var DependencyError = require('./dependency-error');
    throw new DependencyError(this.messages.join(''));
  }
};

module.exports = Reporter;
