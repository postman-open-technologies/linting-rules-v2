import assert from 'assert';
import SpectralTestLoader from './spectral-test-loader.js';
import SpectralTestWrapper from './spectral-test-wrapper.js';
import DocumentValidator from './test-document-validator.js';
import * as SpectralTest from './spectral-test.js';

function sortAgainstPath(values){
  return values.sort((a,b) => {
    let result;
    if(a.path < b.path){
      result = -1;
    }
    else if(b.path < a.path){
      result = 1
    }
    else {
      result = 0;
    }
    return result;
  });
}


export function runTests(tests, rulesets, title){

  describe(`Testing [${title}] rulesets [${rulesets}] with tests [${tests}]`, function() {
    // 1 - Loading test and rule files and mapping them
    // TODO: Need to add mapping control, all ruleset have test files, all test files have ruleset
    // Some try/catch hecks to add here about no test founds
    //const mappedTestsRulesets = mapTestsAndRulesets('**/*.rule-test.yaml', '**/*.spectral-v6.yaml');
    //const mappedTestsRulesets = SpectralTestLoader.mapTestsAndRulesets(tests, rulesets);
    //const mapper = new SpectralTestLoader.SpectralTestMapper(tests, rulesets);
    const testLoader = new SpectralTestLoader(tests, rulesets);
  
    describe('Checking ruleset vs test', function() {
      it('must have found runnable tests', function() {
        assert.equal(testLoader.getRunnableTests().length>0, true, 'No runnable tests found');
      });
  
      it('must find no invalid tests', function() {
        assert.deepEqual(testLoader.getInvalidTests(), [], 'Some invalid tests found');
      });
  
      it('must find a test suite for each ruleset', function() {
        assert.deepEqual(testLoader.getWithoutTestRulesets(), [], 'Some rulesets don\'t have test suites');
      });
  
      it('must find ruleset of each test suite', function() {
        assert.deepEqual(testLoader.getWithoutRulesetTests(), [], 'Some tests target non-existing rulesets');
      });
    });
  
    // 2 - Looping on (ruleset/testfile)
    testLoader.getRunnableTests().forEach(rulesetTest => {
      let spectralWrapper;
      let spectralWrapperError;
  
      // 3 - Initializing Spectral with ruleset indicated in test file (that's async!)
      before( async function() {
        // TODO when invalid ruleset it crash everything, need to catch error
        try {
          spectralWrapper = await SpectralTestWrapper.getWrapper(rulesetTest.rulesetFilename);
        }
        catch(e){
          spectralWrapperError = e;
          console.log('error', e);
          //fail(e);
        }

      });
  
      describe('🤖 Checking Spectral Wrapper has been loaded', function(){
        it('no error when loading ruleset with Spectral', function() {
          assert.equal(spectralWrapperError, undefined, 'error when loading');
        });
      })

      // 4 - Testing the ruleset
      describe(`🗂  Testing ruleset ${rulesetTest.test.ruleset}`, function() {
        // x - Checking testsuite content
        describe('Checking ruleset configuration', function() {
          it('all rules of ruleset must have tests', function() {
            // TODO put test loader stuff in a class
            const foundTestedRules = SpectralTest.getRuleNames(rulesetTest.test).sort();
            const expectedTestedRules = spectralWrapper.getRuleNames().sort();
            assert.deepEqual(foundTestedRules, expectedTestedRules, 'some rules have no tests');
          });
          
          it('a spectral wrapper is successfully loaded with targeted ruleset', function() {
            assert.equal(spectralWrapper !== undefined, true, 'spectral wrapper is undefined');
          });
  
        });
  
        // 5 - Looping on rule test in ruleset test
        for (const [rulename, ruleTest] of Object.entries(rulesetTest.test.rules)){
          describe(`📏 Testing rule [${rulename}]`, function() {
            // TODO add checks on given and then content (checking coverage is enough)
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
                const documents = SpectralTest.getAllVersionsOfDocument(givenTest, ruleTest);
                documents.forEach(document => {
                  it(`${givenTest.description} (OpenAPI ${document.version})`, async function() {
  
                    // 8.1 Checking test document is valid
                    const formatFoundProblems = await documentValidator.validate(document.document);
                    const formatExpectedProblems = [];
                    assert.deepEqual(formatFoundProblems, formatExpectedProblems, `test document is not a valid ${ruleTest.format} document`);
  
                    // 8.2 Checking what is found by path
                    // TODO work on "list problems that are not found => expect empty list"
                    // TODO rework the given index stuff, test across all given option? always? stop at first that works?
                    // TODO manage given using aliases (hack Spectral core?): given with aliases test are skipped for now
                    if(!spectralWrapper.getRuleGiven(rulename, givenTest.index).startsWith('#')){
                      const foundPathsAndValues = sortAgainstPath(spectralWrapper.getGivenPathsAndValues(rulename, document.document, givenTest.index));
                      const expectedPathsAndValues = sortAgainstPath(givenTest.expected);
                      // TODO split assert and add message
                      assert.deepEqual(foundPathsAndValues, expectedPathsAndValues);  
                    }
                    else {
                      this.skip();
                    }
                  })  
                });
              });
            });
            // 9 - Testing then
            describe(`Testing rule ${rulename} then`, function() {
              ruleTest.then.forEach(thenTest => {
                const documents = SpectralTest.getAllVersionsOfDocument(thenTest, ruleTest);
                documents.forEach(document => {
                  it(`${thenTest.description} (OpenAPI ${document.version})`, async function() {
  
                    // 9.1 Checking test document is valid
                    const formatFoundProblems = await documentValidator.validate(document.document);
                    const formatExpectedProblems = [];
                    assert.deepEqual(formatFoundProblems, formatExpectedProblems, `test document is not a valid ${ruleTest.format} document`);
  
                    // 9.2 Checking expected problems are found by the rules
                    // TODO work on "list problems that are not found => expect empty list"
                    const foundProblems = sortAgainstPath(await spectralWrapper.lint(rulename, document.document, thenTest.description));
                    const expectedProblems = sortAgainstPath(thenTest.expected);
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
}
