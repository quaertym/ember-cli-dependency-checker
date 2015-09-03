var assert = require('chai').assert;

describe('Utils', function() {

  describe('buildBowerPackagePath', function() {
    it('should return bower directory appended by package name', function() {
      var buildPath = require('../../lib/utils/build-bower-package-path');
      var project = { bowerDirectory: 'bower_components' };
      assert.equal(buildPath(project, 'super-icons'), 'bower_components/super-icons');
    });
  });

  describe('buildNodePackagePath', function() {
    it('should return node modules path appended by package name', function() {
      var buildPath = require('../../lib/utils/build-node-package-path');
      var project = { nodeModulesPath: 'node_modules' };
      assert.equal(buildPath(project, 'awesome-addon'), 'node_modules/awesome-addon');
    });
  });

});
