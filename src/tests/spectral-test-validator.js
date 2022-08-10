import Ajv2020 from 'ajv/dist/2020.js';
import * as fileUtils from './file.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const DEFAULT_FORMAT = 'spectral-v1.0';
const SCHEMAS = {
  'spectral-v1.0': 'spectral-test-validator-schemas/spectral-test-v10.json-schema.yaml'
}

function getTestSuiteSchemaFilepath(schemaFilename) {
  // TODO manage "relative filename"
  const directory = dirname(fileURLToPath(import.meta.url));
  const filepath = directory+'/'+schemaFilename;
  return filepath;
}

function getTestSuiteSchema(filepath) {
  // TODO manage YAML and JSON format for schemas?
  const schema = fileUtils.loadYaml(filepath);
  return schema;
}

export default class SpectralTestValidator {
  constructor() {
    this.formats = [];
    for (const [formatName, schemaFilename] of Object.entries(SCHEMAS)) {
      const filepath = getTestSuiteSchemaFilepath(schemaFilename);
      const schema = getTestSuiteSchema(filepath);
      const ajv = new Ajv2020({allErrors: true}); // options can be passed, e.g. {allErrors: true}
      // validate is a function
      const validateFunction = ajv.compile(schema);
      this.formats.push({
        name: formatName,
        schema: schema,
        validate: validateFunction 
      });
    }
  }

  // TODO warning will not support concurrency, do compilation each time? Clone errors?
  validate(document) {
    let formatName = document.testSuiteVersion;
    if(formatName === undefined) {
      formatName = DEFAULT_FORMAT
    }
    const format = this.formats.find(format => format.name === formatName);
    const valid = format.validate(document);
    let problems;
    if(valid) {
      problems = [];
    }
    else {
      problems = format.validate.errors;
    }
    return problems;
  }
}

/*
const validator = new TestSuiteValidator();
const document = fileUtils.loadYaml('./tests/specifications/openapi/info-contact.rule-test.yaml');
const problems = validator.validate(document);
console.log('problems', problems);
*/