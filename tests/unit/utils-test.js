/* eslint-env node, mocha */
const assert = require('chai').assert;
const path = require('path');

describe('Utils', function() {

  describe('buildBowerPackagePath', function() {
    it('should return bower directory appended by package name', function() {
      const buildPath = require('../../lib/utils/build-bower-package-path');
      const project = { bowerDirectory: 'bower_components' };
      assert.equal(buildPath(project, 'super-icons'), 'bower_components' + path.sep + 'super-icons');
    });
  });

});
