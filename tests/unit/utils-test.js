/* eslint-env node, mocha */
var assert = require('chai').assert;
var path = require('path');

describe('Utils', function() {

  describe('buildBowerPackagePath', function() {
    it('should return bower directory appended by package name', function() {
      var buildPath = require('../../lib/utils/build-bower-package-path');
      var project = { bowerDirectory: 'bower_components' };
      assert.equal(buildPath(project, 'super-icons'), 'bower_components' + path.sep + 'super-icons');
    });
  });

});
