import assert from 'assert';
import * as SpectralTestLoader from './spectral-test-loader.js';
import SpectralTestWrapper from './spectral-test-wrapper.js';
import DocumentValidator from './document-validator.js';

const tests = '**/*.rule-test.yaml';
const rulesets = '**/*.spectral-v6.yaml';

describe(`Testing rulesets [${rulesets}] with tests [${tests}]`, function() {
  // 1 - Loading test and rule files and mapping them
  // TODO: Need to add mapping control, all ruleset have test files, all test files have ruleset
  // Some try/catch hecks to add here about no test founds
  //const mappedTestsRulesets = mapTestsAndRulesets('**/*.rule-test.yaml', '**/*.spectral-v6.yaml');
  const mappedTestsRulesets = SpectralTestLoader.mapTestsAndRulesets(tests, rulesets);
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
          let documentValidator;

          before(async function() {
            documentValidator = await DocumentValidator.getValidator(ruleTest.format);
          });

          // 6 - Testing formats
          const formatsString = `${ruleTest.format} [${ruleTest.versions.join(',')}]`; 
          it(`must target format(s) ${formatsString}`, function() {
            const foundFormatVersions = spectralWrapper.getRuleFormatAndVersions(rulename);
            const expectedVersions = ruleTest.versions;
            const expectedFormat = ruleTest.format;
            assert.deepEqual(foundFormatVersions.format, expectedFormat, 'Wrong format found');
            assert.deepEqual(foundFormatVersions.versions, expectedVersions, 'Wrong format version(s) found');
          });
          // 7 - Testing severity
          it(`must have severity ${ruleTest.severity}`, function() {
            const foundSeverity = spectralWrapper.getRuleSeverity(rulename);
            const expectedSeverity = ruleTest.severity;
            assert.equal(foundSeverity, expectedSeverity);
          });
          // 8 - Testing given
          describe(`Testing rule ${rulename} given`, function() {
            ruleTest.given.forEach(givenTest => {
              const documents = SpectralTestLoader.getAllVersionsDocuments(givenTest.document, ruleTest.versions);
              documents.forEach(document => {
                it(`${givenTest.description} (OpenAPI ${document.version})`, async function() {

                  // 8.1 Checking test document is valid
                  const formatFoundProblems = await documentValidator.validate(document.document);
                  const formatExpectedProblems = [];
                  assert.deepEqual(formatFoundProblems, formatExpectedProblems, `test document is not a valid ${ruleTest.format} document`);

                  // 8.2 Checking what is found by path
                  const foundPathsAndValues = spectralWrapper.getGivenPathsAndValues(rulename, document.document);
                  const expectedPathsAndValues = givenTest.paths;
                  // TODO split assert and add message
                  assert.deepEqual(foundPathsAndValues, expectedPathsAndValues);
                })  
              });
            });
          });
          // 9 - Testing then
          describe(`Testing rule ${rulename} then`, function() {
            ruleTest.then.forEach(thenTest => {
              const documents = SpectralTestLoader.getAllVersionsDocuments(thenTest.document, ruleTest.versions);
              documents.forEach(document => {
                it(`${thenTest.description} (OpenAPI ${document.version})`, async function() {

                  // 9.1 Checking test document is valid
                  const formatFoundProblems = await documentValidator.validate(document.document);
                  const formatExpectedProblems = [];
                  assert.deepEqual(formatFoundProblems, formatExpectedProblems, `test document is not a valid ${ruleTest.format} document`);

                  // 9.2 Checking expected problems are found by the rules
                  const foundProblems = await spectralWrapper.lint(rulename, document.document, thenTest.description);
                  const expectedProblems = thenTest.problems;
                  // TODO split assert and add message
                  assert.deepEqual(foundProblems, expectedProblems);
                });  
              });
            });
          });
        });
      }
    });
  });
});