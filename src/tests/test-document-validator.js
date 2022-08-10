import {resolve} from 'path';
// Spectral
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import fs from 'fs';
import spectralRuntime from "@stoplight/spectral-runtime";
const { fetch } = spectralRuntime;
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!


import { dirname } from 'path';
import { fileURLToPath } from 'url';


function getRulesetFilename(format) {
  const formats = {
    openapi: 'test-document-validator-openapi.yaml'
  }
  const directory = dirname(fileURLToPath(import.meta.url));
  const filename = directory+'/'+formats[format];
  return filename;
}

const toFilterProblems = [
  // OpenAPI 3.1 fix: schema is wrong, url and identifier are optional and mutually exclusive
  // See https://github.com/OAI/OpenAPI-Specification/issues/2975
  {
    code: 'oas3-schema',
    message: "\"license\" property must have required property \"identifier\"."
  }
];

function isToBeFilteredProblem(problem){
  let result = false;
  toFilterProblems.forEach(toFilter => {
    if(toFilter.code === problem.code && toFilter.message === problem.message){
      result = true;
    }
  })
  return result;
}

function filterProblemList(problems, format) {
  return problems.filter( problem => {
    !isToBeFilteredProblem(problem)
  });
}
  // TODO fix ugly copy/paste coming from wrapper
function getSpectralDocument(json, name) {
    const jsonAsString = JSON.stringify(json, null, 2);
    const document = new Document(
      jsonAsString,
      Parsers.Json,
      name,
    );
    return document
  }


export default class DocumentValidator {

  constructor() {}

  async initialize(format){
    const rulesetFilename = getRulesetFilename(format);
    const ruleset = await bundleAndLoadRuleset(resolve(rulesetFilename), { fs, fetch })
    this.spectral = new Spectral();
    this.spectral.setRuleset(ruleset);
  }

  // Constructor can't be async so doing this
  static async getValidator(format) {
    const validator = new DocumentValidator();
    await validator.initialize(format);
    return validator;
  }

  async validate(documentJson, documentName) {
    const document = getSpectralDocument(documentJson, documentName);
    const problems = await this.spectral.run(document);
    return filterProblemList(problems);
  }

}

/*
const document = {
  "openapi": "3.0.3",
  "info": {
    "title": "an api name",
    "version": "1.0",
    "contacte": {
      "name": "a contact name"
    }
  },
  "paths": {}
}

const validator = await DocumentValidator.getValidator('openapi');
console.log(await validator.validate(document));
*/