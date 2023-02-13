// To get absolute path required by Spectral bundler
import {resolve} from 'path';
// Spectral
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import fs from 'fs';
import spectralRuntime from "@stoplight/spectral-runtime";
const { fetch } = spectralRuntime;
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!

// JSON Path Plus
import {JSONPath} from 'jsonpath-plus';
// to load pure rule without parsing
import * as fileUtils from './file.js';

function spectralPathToJsonPointer(path){
  const escapedPath = path.map(value => value.replaceAll('/','~1'));
  const jsonPointer = `#/${escapedPath.join('/')}`;
  return jsonPointer;
}

export default class SpectralTestWrapper {

  constructor() {}

  async initialize(rulesetFilename){
    this.absolutePath = resolve(rulesetFilename);
    this.rulesetRaw = fileUtils.loadYaml(this.absolutePath);
    const ruleset = await bundleAndLoadRuleset(this.absolutePath, { fs, fetch })
    this.spectral = new Spectral();
    this.spectral.setRuleset(ruleset);
  }

  // Constructor can't be async so doing this
  static async getWrapper(rulesetFilename) {
    const wrapper = await new SpectralTestWrapper();
    await wrapper.initialize(rulesetFilename);
    return wrapper;
  }


  getRuleDefinition(rulename) {
    return this.spectral.ruleset.rules[rulename].definition;
  }

  getRawRuleDefinition(rulename) {
    return this.rulesetRaw.rules[rulename];
  }

  getRuleNames() {
    return Object.keys(this.spectral.ruleset.rules);
  }


  /*********************/
  /* JSON Path Methods */
  /*********************/

  getRuleGivens(rulename) {
    const rule = this.getRuleDefinition(rulename);
    let givens;
    if(Array.isArray(rule.given)) {
      givens = rule.given;
    }
    else {
      givens = [rule.given];
    }
    return givens;  
  }
  
  getRuleGiven(rulename, index=0) {
    return this.getRuleGivens(rulename)[index];
  }

  // TODO handle aliases by hacking Spectral inner code/functions or running a dummy rule with then.function: undefined
  // TODO Add given to result?
  getGivenPathsAndValues(rulename, document, givenIndex=null) {
    if(givenIndex !== null) { // keeping old behavior just in case
      const given = this.getRuleGiven(rulename, givenIndex);
      const results = JSONPath({ resultType: 'all', path: given, json: document });
      const pathsAndValues = results.map( result => ({ path: `#${result.pointer}`, value: result.value}));
      return pathsAndValues;
    }
    else {
      let pathsAndValues = [];
      this.getRuleGivens(rulename).forEach(given => {
        const jsonPathResults = JSONPath({ resultType: 'all', path: given, json: document });
        const givenResults = jsonPathResults.map( result => ({ path: `#${result.pointer}`, value: result.value}))
        pathsAndValues = pathsAndValues.concat(givenResults);
      });
      return pathsAndValues;
    }

  }

  /*******************/
  /* Linting Methods */
  /*******************/

  static getSpectralDocument(json, name) {
    const jsonAsString = JSON.stringify(json, null, 2);
    const document = new Document(
      jsonAsString,
      Parsers.Json,
      name,
    );
    return document
  }

  async lint(rulename, documentJson, documentName) {
    // TODO disable all rule except rulename
    // TODO enable a single then testing with a thenIndex optional argument
    const document = SpectralTestWrapper.getSpectralDocument(documentJson, documentName);
    const problems = await this.spectral.run(document);
    const simplifiedProblems = problems
                                  .filter(problem => (problem.code === rulename))
                                  .map(problem => ({ path: spectralPathToJsonPointer(problem.path)}));
    return simplifiedProblems;
  }

  /* Severity */
  getRuleSeverity(rulename){
    return this.getRuleDefinition(rulename).severity;
  }

  /* Format and Versions of spec targeted */
  // TODO do not take for granted that a rule works on a single format
  getRuleFormatAndVersions(rulename){
    const rule = this.getRawRuleDefinition(rulename);
    //console.log(rule);
    const formats = {
      'oas2':   { format: 'openapi', versions: [ '2.0' ] },
      'oas3':   { format: 'openapi', versions: [ '3.0', '3.1' ]},
      'oas3_0': { format: 'openapi', versions: [ '3.0'] },
      'oas3_1': { format: 'openapi', versions: [ '3.1' ]}
    }
    let format;
    let versions = []
    rule.formats.forEach(item => {
      format = formats[item].format;
      versions = Array.from(new Set(versions.concat(formats[item].versions))); 
    });
    const result = {
      format: format,
      versions: versions
    };
    //console.log(result);
    return result;
  }

}