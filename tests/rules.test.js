import * as SpectralTestRunner from '../src/tests/spectral-test-runner.js';

// Optional --rule=a-rule-name parameter to test only one rule instead of all
const rule = process.env.npm_config_rule; 

let title;
let tests;
let rulesets;

// Testing the rule specified with --rule=a-rule-name
if(rule !== undefined) {
  title = `validated OpenAPI rules:${rule}`;
  tests = `./specifications/openapi/rules/${rule}/*/*.rule-test.yaml`;
  rulesets = `./specifications/openapi/rules/${rule}/*/*.spectral-v6.yaml`;
}
// Testing all rules
else {
  title = 'validated OpenAPI rules'
  tests = './specifications/openapi/rules/**/*.rule-test.yaml';
  rulesets = './specifications/openapi/rules/**/*.spectral-v6.yaml';  
}

SpectralTestRunner.runTests(tests, rulesets, title);