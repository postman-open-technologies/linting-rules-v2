import * as Source from './parse-all-json.js';
import * as Selected from './parse-selected.js';
import * as Ruleset from './ruleset.js';

// node specifications/openapi/raw-rules/index.js specifications/openapi/raw-rules/all.json specifications/openapi/raw-rules/selected-v10.csv specifications/openapi/selected-rules

const args = process.argv.slice(2);
const allJsonFilename = args[0];
const selectedCsvFilename = args[1];
const targetDirectory = args[2];

const allRules = Source.loadAllRules(allJsonFilename);
const selectedRules = Selected.loadSelectedRules(selectedCsvFilename);
Selected.updateAllRuleWithSelected(selectedRules, allRules);

const normalizedSample = allRules.normalizedRules.find(rule => rule.id === 'info-contact');
console.log('normalized sample', JSON.stringify(normalizedSample, null, 2));

console.log('stats', JSON.stringify(allRules.stats, null, 2));
//console.log('selectedRules.stats', JSON.stringify(selectedRules.stats, null, 2));

const normalizedSelectedRules = allRules.normalizedRules.filter(rule => rule.selected);
const report = Ruleset.saveRulesets(normalizedSelectedRules, targetDirectory);
console.log('report', JSON.stringify(report, null, 2));