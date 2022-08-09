import fs  from 'fs';
import assert  from 'assert';

export function deepEqual(a, b){
  let deepEqual;
  try {
    assert.deepEqual(a, b);
    deepEqual = true;
  }
  catch(Exception){
    deepEqual = false
  }
  return deepEqual;
}

export function getNormalizedId(rule){
  return rule.slug.replace('swagger-v2-','').replace('openapi-v3-', '');  
}

function getNormalizedName(rule){
  return rule.name.replace('Swagger V2 - ','').replace('OpenAPI V3 - ','');
}

function getVersion(rule){
  let version;
  if(rule.slug.startsWith('openapi')){
    version = "3.0";
  }
  else {
    version = "2.0";
  }
  return version;
}

function getRules(filename){
  const content = fs.readFileSync(filename);
  let rules = JSON.parse(content); 
  return rules; 
}

function createSourceRule(rule) {
  return {
    version: getVersion(rule),
    sourceName: 'legacy',
    sourceRule: rule
  }
}

function normalizeRules(rules){
  const normalizedRules = [];

  rules.forEach(rule => {
    const id = getNormalizedId(rule);
    const alreadyNormalizedRule = normalizedRules.find(rule => rule.id === id);
    if(alreadyNormalizedRule){
      alreadyNormalizedRule.sources.push(createSourceRule(rule));
      alreadyNormalizedRule.identicalSources = deepEqual(alreadyNormalizedRule.sources[0].sourceRule.rule, alreadyNormalizedRule.sources[1].sourceRule.rule);
    }
    else {
      normalizedRules.push({
        id: id,
        name: getNormalizedName(rule),
        description: rule.rule.description,
        sources: [createSourceRule(rule)]
      });
    }
  });
  
  return normalizedRules;

}

export function loadAllRules(inputFilename) {
  const rules = getRules(inputFilename);
  const normalizedRules = normalizeRules(rules);
  let singleVersionRules = 0;
  let identicalSource = 0;
  normalizedRules.forEach(rule => {
    if(rule.sources.length < 2){
      singleVersionRules++;
    }
    else{
      if(rule.identicalSources){
        identicalSource++;
      }
    }
  });
  return {
    rawRules: rules,
    normalizedRules: normalizedRules,
    stats:{
      rawRulesCount: rules.length,
      normalizedRulesCount: normalizedRules.length,
      normalizedRulesIdenticalCount: identicalSource,
      singleVersionRulesCount: singleVersionRules
    }
  };
}