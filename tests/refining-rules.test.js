import * as SpectralTestRunner from '../src/tests/spectral-test-runner.js';

//const tests = '**/*.rule-test.yaml';
//const rulesets = '**/*.spectral-v6.yaml';
// Targeting only the selected rules in rule
const title = 'refining OpenAPI rules'
const tests = './specifications/openapi/sources/refining-rules/**/*.rule-test.yaml';
const rulesets = './specifications/openapi/sources/refining-rules/**/*.spectral-v6.yaml';

SpectralTestRunner.runTests(tests, rulesets, title);