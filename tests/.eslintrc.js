module.exports = {
  plugins: [
    'mocha'
  ],
  env: {
    mocha: true
  },
  rules: {
    // JSHint "expr", disabled due to chai expect assertions
    'no-unused-expressions': 0,

    // JSHint "unused"
    'no-unused-vars': 0,

    'quotes': [2, 'single', {
      'allowTemplateLiterals': true,
    }],

    // disabled because describe(), it(), etc. should not use arrow functions
    'prefer-arrow-callback': 0,

    /*** mocha ***/

    'mocha/no-exclusive-tests': 'error',
    'mocha/no-skipped-tests': 'off',
    'mocha/no-pending-tests': 'off',
    'mocha/handle-done-callback': 'error',
    'mocha/no-synchronous-tests': 'off',
    'mocha/no-global-tests': 'error',
    'mocha/no-return-and-callback': 'error',
    'mocha/valid-test-description': 'off',
    'mocha/valid-suite-description': 'off',
    'mocha/no-sibling-hooks': 'error',
    'mocha/no-mocha-arrows': 'error',
    'mocha/no-hooks': 'off',
    'mocha/no-hooks-for-single-case': 'off',
    'mocha/no-top-level-hooks': 'error',
    'mocha/no-identical-title': 'error',
    'mocha/max-top-level-suites': 'off',
    'mocha/no-nested-tests': 'error'
  }
};
