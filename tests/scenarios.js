/* eslint-env node, mocha */
const { Scenarios } = require('scenario-tester');
const assert = require('chai').assert;
const { dirname } = require('path');

const addonDir = dirname(__dirname);

Scenarios.fromDir(addonDir)
  .expand({
    lts_3_4,
    lts_3_8,
    lts_3_12,
    lts_3_16,
    lts_3_20,
    lts_3_24,
    lts_3_28,
    release,
    beta,
  })
  .forEachScenario((scenario) => {
    describe(scenario.name, function () {
      let app;

      beforeEach(async () => {
        app = await scenario.prepare();
      });

      it(`yarn test`, async function () {
        let result = await app.execute('yarn test');
        assert.equal(result.exitCode, 0, result.output);
      });
    });
  });

async function lts_3_4(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: addonDir,
    resolveName: 'ember-cli-3.4',
  });
}

async function lts_3_8(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: addonDir,
    resolveName: 'ember-cli-3.8',
  });
}

async function lts_3_12(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: addonDir,
    resolveName: 'ember-cli-3.12',
  });
}

async function lts_3_16(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: addonDir,
    resolveName: 'ember-cli-3.16',
  });
}

async function lts_3_20(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: addonDir,
    resolveName: 'ember-cli-3.20',
  });
}

async function lts_3_24(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: __dirname,
    resolveName: 'ember-cli-3.24',
  });
}

async function lts_3_28(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: __dirname,
    resolveName: 'ember-cli-3.28',
  });
}

async function release(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: __dirname,
    resolveName: 'ember-cli-latest',
  });
}

async function beta(project) {
  project.linkDevDependency('ember-cli', {
    baseDir: __dirname,
    resolveName: 'ember-cli-beta',
  });
}
