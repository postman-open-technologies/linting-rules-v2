# Experimental prototype of linting-rule-v2 #

A repository of (Spectral) linting rules, rulesets and functions.
# Package.json commands:

- `npm run test`: runs all tests.
- `npm run test:rules`: runs tests on validated rules.
- `npm run test:refining-rules`: runs tests on rules currently being refined (`sources/refining-rules`),
- `npm run test:refining-rules --rule=<rule-name>`: runs tests on a specific rule from the ones currently being refined (`sources/refining-rules`),
- `npm run init:refining-rule <rule-name>` create a `rule-name` folder and its content in `sources/refining-rules`

# About Spectral Rule Tests

Contains an experimental Spectral Test framework/format.

- Look at `specifications/openapi/rules/tests/info-contact.rule-test.yaml` to see a file prototype.
- The test source code is located in `src/tests`.