'use strict';

const glob = require('glob');
const Mocha = require('mocha');

const mocha = new Mocha({
  reporter: 'spec'
});

const root = 'tests/{unit,acceptance}';

function addFiles(mocha, files) {
  glob.sync(root + files).forEach(mocha.addFile.bind(mocha));
}

addFiles(mocha, '/**/*-test.js');

mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});
