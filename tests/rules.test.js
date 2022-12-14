import * as SpectralTestRunner from '../src/tests/spectral-test-runner.js';

//const tests = '**/*.rule-test.yaml';
//const rulesets = '**/*.spectral-v6.yaml';
// Targeting only the validated rules in rule
const title = 'validated OpenAPI rules'
const tests = './specifications/openapi/rules/**/*.rule-test.yaml';
const rulesets = './specifications/openapi/rules/**/*.spectral-v6.yaml';

SpectralTestRunner.runTests(tests, rulesets, title);