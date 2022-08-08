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


export default class SpectralTestWrapper {

  constructor() {}

  async initialize(rulesetFilename){
    this.absolutePath = resolve(rulesetFilename);
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


  /*********************/
  /* JSON Path Methods */
  /*********************/
  getRuleDefinition(rulename) {
    return this.spectral.ruleset.rules[rulename].definition;
  }

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

  getGivenPathsAndValues(rulename, document, givenIndex=0) {
    const given = this.getRuleGiven(rulename, givenIndex);
    // TODO handle aliases by hacking Spectral inner code/functions
    const results = JSONPath({ resultType: 'all', path: given, json: document });
    const pathsAndValues = results.map( result => ({ path: result.pointer, value: result.value}));
    return pathsAndValues;
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
    //console.log('problems', problems);
    const simplifiedProblems = problems
                                  .filter(problem => (problem.code === rulename))
                                  .map(problem => ({ path: '/'+problem.path.join('/')}));
    //console.log('simplifiedProblems', simplifiedProblems);
    return simplifiedProblems;
  }

  /* Severity */
  getRuleSeverity(rulename){
    return this.getRuleDefinition(rulename).severity;
  }

}