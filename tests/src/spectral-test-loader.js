import glob from 'glob';
import {resolve} from 'path';
import * as fileUtils from './file.js';

import * as OpenApiUtils from './openapi.js';


function mapTestsAndRulesetsV2(testFilenamePattern, rulesetFilenamePattern){
  const testFilenames = listFiles(testFilenamePattern);
  const rulesetFilenames = listFiles(rulesetFilenamePattern);
  const results = {
    ok: [],
    noTest: rulesetFilenames,
    noRuleset: []
  }
  testFilenames.forEach(testFilename => {
    const test = loadTest(testFilename);
    const rulesetFilename = rulesetFilenames.find(item => item.endsWith(test.ruleset));
    if(rulesetFilename){
      const rulesetFilenameIndex = rulesetFilenames.findIndex(item => item.endsWith(test.ruleset));
      rulesetFilenames.splice(rulesetFilenameIndex, 1);
      results.ok.push({
        rulesetFilename: rulesetFilename,
        testFilename: testFilename,
        test: test
      });
    }
    else {
      results.noRuleset.push({
        testFilename: testFilename,
        testRuleset: test.ruleset
      });
    }
  });
  // Will add unmapped test
  return results;
}
export class SpectralTestMapper {

  constructor(testFilenamePattern, rulesetFilenamePattern) {
    this.testFilenamePattern = testFilenamePattern;
    this.rulesetFilenamePattern = rulesetFilenamePattern;
    this.testFilenames = listFiles(testFilenamePattern);
    this.rulesetFilenames = listFiles(rulesetFilenamePattern);  
    this.mapping = mapTestsAndRulesetsV2(testFilenamePattern, rulesetFilenamePattern);
  }

  getTests() {
    return this.mapping.ok;
  }

  getRulesetsWithoutTest(){
    return this.mapping.noTest;
  }

  getTestsWithoutRuleset(){
    return this.mapping.noRuleset;
  }

}

function listFiles(pattern) {
  const paths = glob.sync(pattern);
  // Turning relative path in absolute ones
  const absolutePaths = paths.map(path => resolve(path));
  return absolutePaths;
}

function loadTest(filename) {
  const data = fileUtils.loadYaml(filename);
  // Will add JSON Schema validation
  return data;
}

export function mapTestsAndRulesets(testFilenamePattern, rulesetFilenamePattern){
  const results = []
  const testFilenames = listFiles(testFilenamePattern);
  const rulesetFilenames = listFiles(rulesetFilenamePattern);
  testFilenames.forEach(testFilename => {
    const test = loadTest(testFilename);
    const rulesetFilename = rulesetFilenames.find(item => item.endsWith(test.ruleset));
    if(rulesetFilename){
      results.push({
        rulesetFilename: rulesetFilename,
        testFilename: testFilename,
        test: test
      });
    }
  });
  // Will add unmapped test
  return results;
}

export function getRuleNames(testSuite) {
  return Object.keys(testSuite.tests);
}

export function getAllVersionsDocuments(document, versions) {
  const documentVersion = OpenApiUtils.getOpenApiVersionFromDocument(document);
  const documents = [];
  if(documentVersion === "{{versions}}"){
    versions.forEach(version => {
      documents.push({
        version: OpenApiUtils.getShortVersionValue(version),
        document: OpenApiUtils.getDocumentWithVersion(document, version)
      }
      )
    });
  }
  else {
    documents.push({
      version: OpenApiUtils.getShortVersionValue(documentVersion), 
      document: document
    });
  }
  return documents;
}

/*
let document = {
  "openapi": "3.1.0",
  "info": {
    "title": "an api name",
    "version": "1.0"
  },
  "paths": {}
}

console.log('getAllVersionsDocuments', getAllVersionsDocuments(document, ["2.0", "3.0", "3.1"]));

document = {
  "openapi": "{{versions}}",
  "info": {
    "title": "an api name",
    "version": "1.0"
  },
  "paths": {}
}

console.log('getAllVersionsDocuments', getAllVersionsDocuments(document, ["2.0", "3.0", "3.1"]));
*/
