import * as FileUtils from './file.js';
import SpectralTestValidator from './spectral-test-validator.js';

function mapTestsAndRulesets(testFilenames, rulesetFilenames){
  const validator = new SpectralTestValidator();
  const results = {
    runnableTests: [],
    withoutTestRulesets: [],
    withoutRulesetTests: [],
    invalidTests: []
  }
  const notFoundRulesetFilenames = JSON.parse(JSON.stringify(rulesetFilenames));
  testFilenames.forEach(testFilename => {
    const test = FileUtils.loadYaml(testFilename);
    const testValidatorProblems = validator.validate(test);
    if(testValidatorProblems.length > 0){
      results.invalidTests.push({
        testFilename: testFilename,
        problems: testValidatorProblems
      })
    }
    else {
      const rulesetFilename = notFoundRulesetFilenames.find(item => item.endsWith(test.ruleset));
      if(rulesetFilename){
        const rulesetFilenameIndex = notFoundRulesetFilenames.findIndex(item => item.endsWith(test.ruleset));
        notFoundRulesetFilenames.splice(rulesetFilenameIndex, 1);
        results.runnableTests.push({
          rulesetFilename: rulesetFilename,
          testFilename: testFilename,
          test: test
        });
      }
      else {
        results.withoutRulesetTests.push({
          testFilename: testFilename,
          testRuleset: test.ruleset
        });
      }
    }
  });
  notFoundRulesetFilenames.forEach(rulesetFilename => {
    results.withoutTestRulesets.push({rulesetFilename: rulesetFilename});
  });
  // Will add unmapped test
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
/*
const loader = new SpectralTestLoader(tests, rulesets);
console.log('runnable tests', loader.getRunnableTests());
console.log('tests without rulesets', loader.getWithoutRulesetTests());
console.log('rulesets without tests', loader.getWithoutTestRulesets());
console.log('invalid tests', loader.getInvalidTests());
*/