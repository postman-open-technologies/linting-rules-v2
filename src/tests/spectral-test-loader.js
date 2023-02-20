import * as FileUtils from './file.js';
import SpectralTestValidator from './spectral-test-validator.js';
import * as path from 'path';

function mapTestsAndRulesets(testFilenames, rulesetFilenames){
  
  const validator = new SpectralTestValidator();
  
  const results = {
    runnableTests: [],
    withoutTestRulesets: [],
    withoutRulesetTests: [],
    invalidTests: []
  }
  
  // List telling which test file exist for which ruleset file
  const rulesetVsTests = rulesetFilenames.map( filename => { return { rulesetFilename: filename, testFilenames: [], test: null } });
  // Looping on test files
  testFilenames.forEach(testFilename => {
    // Loading and validating test file against the JSON schema
    const test = FileUtils.loadYaml(testFilename);
    const testValidatorProblems = validator.validate(test);
    // Test file is not valid against schema
    if(testValidatorProblems.length > 0){
      results.invalidTests.push({
        testFilename: testFilename,
        problems: testValidatorProblems
      })
    }
    // Test file is loaded and valid against schema
    else {
      // Looking for matching ruleset
      const testDirname = path.dirname(testFilename);
      let rulesetFilename;
      if(path.isAbsolute(test.ruleset)) {
        rulesetFilename = test.ruleset;
      }
      else {
        rulesetFilename = path.join(testDirname, test.ruleset);
      }
      rulesetFilename = path.resolve(rulesetFilename);
      
      const rulesetVsTest = rulesetVsTests.find(item => item.rulesetFilename === rulesetFilename);
      if(rulesetVsTest){
        // Merging tests from different test files targeting the same ruleset
        // TODO manage duplicate tests (same rule of a ruleset tested in different files)
        if(rulesetVsTest.test === null){
          rulesetVsTest.test = test;  
        }
        else {
          rulesetVsTest.test.rules = {
            ...rulesetVsTest.test.rules,
            ...test.rules
          }
        }
        // Logging test filename
        rulesetVsTest.testFilenames.push(testFilename);
      }
      // No ruleset found, this test file targets a non existing ruleset file
      else {
        results.withoutRulesetTests.push({
          testFilename: testFilename,
          testRuleset: rulesetFilename,
        });
      }
    }
  });
  rulesetVsTests.forEach(item => {
    // Listing rulesets without any test
    if(item.test === null){
      results.withoutTestRulesets.push({rulesetFilename: item.rulesetFilename});
    }
    // Runnable tests
    else {
      // Adding test to runnable test list
      /*results.runnableTests.push({
        rulesetFilename: rulesetVsTest.rulesetFilename,
        testFilename: testFilename,
        test: test
      });*/
      results.runnableTests.push(item);
    }
  });
  return results;
}

export default class SpectralTestLoader {

  constructor(testFilenamePattern, rulesetFilenamePattern) {
    this.testFilenamePattern = testFilenamePattern;
    this.rulesetFilenamePattern = rulesetFilenamePattern;
    this.testFilenames = FileUtils.listFiles(testFilenamePattern);
    this.rulesetFilenames = FileUtils.listFiles(rulesetFilenamePattern);  
    this.mapping = mapTestsAndRulesets(this.testFilenames, this.rulesetFilenames);
  }

  getRunnableTests() {
    return this.mapping.runnableTests;
  }

  getWithoutTestRulesets(){
    return this.mapping.withoutTestRulesets;
  }

  getWithoutRulesetTests(){
    return this.mapping.withoutRulesetTests;
  }

  getInvalidTests() {
    return this.mapping.invalidTests;
  }

}


//const tests = '**/*.rule-test.yaml';
//const rulesets = '**/*.spectral-v6.yaml';
//const tests = './specifications/openapi/sources/refining-rules/**/*.rule-test.yaml';
//const rulesets = './specifications/openapi/sources/refining-rules/**/*.spectral-v6.yaml';
/*
const loader = new SpectralTestLoader(tests, rulesets);
console.log('runnable tests', loader.getRunnableTests());
console.log('tests without rulesets', loader.getWithoutRulesetTests());
console.log('rulesets without tests', loader.getWithoutTestRulesets());
console.log('invalid tests', loader.getInvalidTests());
*/