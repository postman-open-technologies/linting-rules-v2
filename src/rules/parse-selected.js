import { parse } from 'csv-parse/sync';
import fs  from 'fs';
import * as Source from './parse-all-json.js';

function loadCsv(filename){
  const content = fs.readFileSync(filename);
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });
  return records;
}

export function loadSelectedRules(filename){
  const rules = loadCsv(filename);
  return {
    rules: rules,
    stats:{
      total: rules.length
    }
  };
}

export function updateAllRuleWithSelected(selectedRules, allRules){
  let normalizedSelected = 0;
  selectedRules.rules.forEach(selectedRule => {
    const id = Source.getNormalizedId(selectedRule);
    const normalizedRule = allRules.normalizedRules.find(rule => rule.id === id);
    const sourceRule = normalizedRule.sources.find(rule => rule.sourceRule.slug === selectedRule.slug);
    sourceRule.documentation = {
      category: selectedRule.category,
      issueDescription: selectedRule.learningCenterIssueDescription,
      fixDescription:  selectedRule.learningCenterFixDescription,
    };
    if(normalizedRule.selected){
      normalizedRule.identicalDocumentation = Source.deepEqual(normalizedRule.sources[0].documentation, normalizedRule.sources[1].documentation);
    }
    else{
      normalizedSelected++;
      normalizedRule.selected = true;
    }
    
  });
  let singleVersionRules = 0;
  let identicalSource = 0;
  allRules.normalizedRules.forEach(rule => {
    if(rule.selected){
      if(rule.sources.length < 2){
        singleVersionRules++;
      }
      if(rule.identicalSource){
        identicalSource++;
      }
    }

  });

  allRules.stats.selectedCount = selectedRules.rules.length;
  allRules.stats.selectedNormalizedCount = normalizedSelected;
  allRules.stats.selectedSingleVersionCount = singleVersionRules;
  allRules.stats.selectedIdenticalSourceCount = identicalSource;
}
