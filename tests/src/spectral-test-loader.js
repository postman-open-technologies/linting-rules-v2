import fs from 'fs';
import yaml from 'js-yaml';
import glob from 'glob';
import {resolve} from 'path';


function listFiles(pattern) {
  const paths = glob.sync(pattern);
  // Turning relative path in absolute ones
  const absolutePaths = paths.map(path => resolve(path));
  return absolutePaths;
}

function loadYaml(filename) {
  // Will add JSON Schema validation
  const fileContents = fs.readFileSync(filename, 'utf8');
  const data = yaml.load(fileContents);
  return data;
}


function loadTest(filename) {
  const data = loadYaml(filename);
  // Will add JSON Schema validation
  return data;
}

export default function mapTestsAndRulesets(testFilenamePattern, rulesetFilenamePattern){
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