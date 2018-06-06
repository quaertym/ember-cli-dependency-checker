var assert = require('chai').assert;
var isTarGz = require('../../lib/utils/is-tar-gz');

describe('IsTarGz', function () {
  describe('recognizes tar ball', function () {

    it('when url ends with .tar', function () {
      var url = 'http://ember-cli.com/example-2.0.0.tar';
      assert.ok(isTarGz(url));
    });

    it('when url ends with .tar.gz', function () {
      var url = 'http://ember-cli.com/example-2.0.0.tar.gz';
      assert.ok(isTarGz(url));
    });

    it('when url ends with .tgz', function () {
      var url = 'http://ember-cli.com/example-2.0.0.tgz';
      assert.ok(isTarGz(url));
    });
  });

  describe('recognizes that url is not a tar ball', function () {
    it('when url contains .tar somewhere', function () {
      var url = 'http://ember-cli.com/example-2.0.0.tar.zip';
      assert.notOk(isTarGz(url));
    });

    it('when url contains .tar.gz somewhere', function () {
      var url = 'http://ember-cli.com/example-2.0.0.tar.gz.zip';
      assert.notOk(isTarGz(url));
    });

    it('when url contains .tgz somewhere', function () {
      var url = 'http://ember-cli.com/example-2.0.0.tgz.zip';
      assert.notOk(isTarGz(url));
    });

    it('when url contains no .tar, .tar.gz or .tgz', function () {
      var url = 'http://ember-cli.com/example-2.0.0.zip';
      assert.notOk(isTarGz(url));
    });
  });

});
