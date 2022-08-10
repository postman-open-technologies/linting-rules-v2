import * as Source from './parse-all-json.js';
import * as Selected from './parse-selected.js';
import * as Ruleset from './ruleset.js';

// node specifications/openapi/raw-rules/index.js specifications/openapi/raw-rules/all.json specifications/openapi/raw-rules/selected-v10.csv specifications/openapi/selected-rules

const args = process.argv.slice(2);
const allJsonFilename = args[0];
const selectedCsvFilename = args[1];
const selectedTargetDirectory = args[2];
const rawTargetDirectory = args[3];

// Loading all.json and selected-v10.csv
const allRules = Source.loadAllRules(allJsonFilename);
const selectedRules = Selected.loadSelectedRules(selectedCsvFilename);
Selected.updateAllRuleWithSelected(selectedRules, allRules);

console.log('stats', JSON.stringify(allRules.stats, null, 2));

//const normalizedSample = allRules.normalizedRules.find(rule => rule.id === 'info-contact');
//console.log('normalized sample', JSON.stringify(normalizedSample, null, 2));

//console.log('selectedRules.stats', JSON.stringify(selectedRules.stats, null, 2));
// Generating data in raw folder
const rawReport = Ruleset.saveRulesets(allRules.normalizedRules, rawTargetDirectory);
console.log('rawReport', JSON.stringify(rawReport, null, 2));

// Generating data in selected folder 
// TODO make that independent from all.json: copy or move selected folder from raw to selected
const normalizedSelectedRules = allRules.normalizedRules.filter(rule => rule.selected);
const selectedReport = Ruleset.saveRulesets(normalizedSelectedRules, selectedTargetDirectory);
console.log('selectedReport', JSON.stringify(selectedReport, null, 2));

// Command line example:
//node src/rules/process-all-json.js specifications/openapi/sources/raw/legacy-data/all.json specifications/openapi/sources/raw/legacy-data/selected-v10.csv specifications/openapi/sources/selected specifications/openapi/sources/raw/legacy