import assert from 'assert';
import mapTestsAndRulesets from './spectral-test-loader.js';
import SpectralTestWrapper from './spectral-test-wrapper.js';

const tests = '**/*.rule-test.yaml';
const rulesets = '**/*.spectral-v6.yaml';

describe(`Testing rulesets [${rulesets}] with tests [${tests}]`, function() {
  // 1 - Loading test and rule files and mapping them
  // TODO: Need to add mapping control, all ruleset have test files, all test files have ruleset
  // Some try/catch hecks to add here about no test founds
  //const mappedTestsRulesets = mapTestsAndRulesets('**/*.rule-test.yaml', '**/*.spectral-v6.yaml');
  const mappedTestsRulesets = mapTestsAndRulesets(tests, rulesets);
  it('must have mapped tests and rulesets', function() {
    assert.equal(mappedTestsRulesets !== undefined, true);
    assert.equal(mappedTestsRulesets.length>0, true);
  });
  // 2 - Looping on (ruleset/testfile)
  mappedTestsRulesets.forEach(item => {
    let spectralWrapper;

    // 3 - Initializing Spectral with ruleset indicated in test file (that's async!)
    before( async function() {
      spectralWrapper = await SpectralTestWrapper.getWrapper(item.rulesetFilename);
    });

    // 4 - Testing the ruleset
    describe(`Testing ruleset ${item.test.ruleset}`, function() {
      it('must have spectral wrapper loaded with ruleset', function() {
        assert.equal(spectralWrapper !== undefined, true, 'spectral wrapper is undefined');
      });

      // 5 - Looping on rule test in ruleset test
      for (const [rulename, ruleTest] of Object.entries(item.test.tests)){
        describe(`Testing rule ${rulename}`, function() {
          // 6 - Testing version
          // 7 - Testing severity
          // 8 - Testing given
          describe(`Testing rule ${rulename} given`, function() {
            ruleTest.given.forEach(givenTest => {
              it(givenTest.description, function() {
                const foundPathsAndValues = spectralWrapper.getGivenPathsAndValues(rulename, givenTest.document);
                const expectedPathsAndValues = givenTest.paths;
                assert.deepEqual(foundPathsAndValues, expectedPathsAndValues);
              })
            });
          });
          // 9 - Testing then
          describe(`Testing rule ${rulename} then`, function() {
            ruleTest.then.forEach(thenTest => {
              it(thenTest.description, async function() {
                const foundProblems = await spectralWrapper.lint(rulename, thenTest.document, thenTest.description);
                const expectedProblems = thenTest.problems;
                assert.deepEqual(foundProblems, expectedProblems);
              });
            });
          });
        });
      }
    });
  });
});