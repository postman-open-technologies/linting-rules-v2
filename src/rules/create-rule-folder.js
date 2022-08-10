import mkdirp from 'mkdirp';
import * as yaml from '../utils/yaml.js';

const args = process.argv.slice(2);
const directory = args[0];
const rulename = args[1];

const targetFolder = `${directory}/${rulename}`

mkdirp.sync(targetFolder);

const meta = {
  "name": rulename,
  "labels": [
    "put some labels here"
  ],
  "reason": "Put a multine\nreason here\n",
  "recommendedSeverity": "recommended Spectral severity",
  "recommended": "true or false",
  "sources": [
    {
      "path": `../../sources/raw/legacy/${rulename}.raw-meta.yaml`
    }
  ]
}

yaml.saveYaml(meta, `${targetFolder}/${rulename}.meta.yaml`);

const rulesFolder = `${directory}/${rulename}/rules`;

mkdirp.sync(rulesFolder);

const testFolder = `${targetFolder}/tests`

const ruleset = {
  "rules": {
    [rulename]: {
      "description": "description",
      "message": "message",
      "given": "jsonpath plus",
      "severity": "severity",
      "formats": [
        "oas2",
        "oas3"
      ],
      "then": {
        "field": "optional field",
        "function": "function name"
      }
    }
  }
}
yaml.saveYaml(ruleset, `${rulesFolder}/${rulename}.openapi-v2-v3.spectral-v6.yaml`);


mkdirp.sync(testFolder);
const test = {
  "testSuiteVersion": "spectral-v1.0",
  "ruleset": `${rulename}.openapi-v2-v3.spectral-v6.yaml`,
  "rules": {
    [rulename]: {
      "format": "openapi",
      "versions": [
        "2.0",
        "3.0",
        "3.1"
      ],
      "severity": "error",
      "given": [
        {
          "description": "must find something",
          "expected": [
            {
              "path": "#/pointer",
              "value": "a value"
            }
          ],
          "documentTemplate": "a document"
        }
      ],
      "then": [
        {
          "description": "must return a problem if there's no ...",
          "expected": [
            {
              "path": "#/..."
            }
          ],
          "documentTemplate": "a document"
        },
        {
          "description": "must return no problem if there's a ...",
          "expected": [],
          "documentTemplate": "a document"
        }
      ]
    }
  }
};

yaml.saveYaml(test, `${testFolder}/${rulename}.rule-test.yaml`);