/* eslint-env node, mocha */
'use strict';

const path           = require('path');
const assert         = require('chai').assert;
const VersionChecker = require('../../lib/version-checker');

describe('VersionChecker', function() {
  describe('does satisfy version', function() {
    it('when the version specified is \'*\'', function() {
      assert.ok(VersionChecker.satisfies('*','1.2.0'));
    });

    it('when the version installed is in the specified range', function() {
      assert.ok(VersionChecker.satisfies('>1.1.0','2.0.0'));
      assert.ok(VersionChecker.satisfies('~1.1.0','1.1.4'));
      assert.ok(VersionChecker.satisfies('^1.1.0','1.2.0'));
      assert.ok(VersionChecker.satisfies('1.x','1.2.0'));
    });

    it('when the version installed matches the version specified', function() {
      assert.ok(VersionChecker.satisfies('1.2.0','1.2.0'));
    });

    it('when the version specified is not a valid range', function() {
      assert.ok(VersionChecker.satisfies('a.b.c','1.2.0'));
    });

    it('when the version specified is git-repo with a matched version', function() {
      assert.ok(VersionChecker.satisfies('git://github.com/stefanpenner/ember-cli.git#v0.1.0','0.1.0'));
    });

    it('when the version specified is git-repo with a non-semver tag', function() {
      assert.ok(VersionChecker.satisfies('git://github.com/stefanpenner/ember-cli.git#master','0.1.0'));
    });

    it('when the version is specified as a path to a tar ball and the installed path is equivalent', function () {
      const installed = path.join('.', 'foo.tgz');
      const specified = path.resolve('foo.tgz');
      assert.ok(VersionChecker.satisfies(installed, specified), `${installed} is equivalent to ${specified}`);
    });
  });

  describe('does not satisfy version', function() {
    it('when the version installed is empty', function() {
      assert.notOk(VersionChecker.satisfies('1.2.0',null));
      assert.notOk(VersionChecker.satisfies('1.2.0',undefined));
      assert.notOk(VersionChecker.satisfies('1.2.0',''));
    });

    it('when the version installed is in the specified range', function() {
      assert.notOk(VersionChecker.satisfies('>1.1.0','0.1.0'));
      assert.notOk(VersionChecker.satisfies('~1.1.0','0.1.0'));
      assert.notOk(VersionChecker.satisfies('^1.1.0','0.1.0'));
      assert.notOk(VersionChecker.satisfies('1.x','0.1.0'));
    });

    it('when the version installed does not match the version specified', function() {
      assert.notOk(VersionChecker.satisfies('1.3.0','1.2.0'));
    });

    it('when the version specified is git-repo with a non-matched version', function() {
      assert.notOk(VersionChecker.satisfies('git://github.com/stefanpenner/ember-cli.git#v0.1.0','1.0.0'));
    });

    it('when the version is specified as a path to a tar ball and the installed path is different', function () {
      const installed = path.join('foo', 'bar.tgz');
      const specified = path.join('quux', 'bar.tgz');
      assert.notOk(VersionChecker.satisfies(installed, specified), `${installed} is not equivalent to ${specified}`);
    });
  });
});
