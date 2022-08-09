import yaml from 'js-yaml';
import mkdirp from 'mkdirp';
import fs  from 'fs';

function generateRuleset(rule, rulename){
  const ruleset = {
    rules: {}
  };
  // Keeping only what we want (removing style and recommended)
  const newRule = {};
  const acceptedKeys = ['description', 'message', 'given', 'severity', 'formats', 'then' ];
  acceptedKeys.forEach(key => {
    if(rule.hasOwnProperty(key)){
      newRule[key] = rule[key];
    }
  })
  
  ruleset.rules[rulename] = newRule;
  return ruleset;
}

function saveYaml(data, filename){
  let content = yaml.dump(data);
  fs.writeFileSync(filename, content, 'utf8');
}

function saveRuleset(rule, rulename, filename){
  const ruleset = generateRuleset(rule, rulename);
  saveYaml(ruleset, filename);
}


export function saveRulesets(normalizedRules, directory){
  const report = [];
  normalizedRules.forEach(rule => {
    const rulesetDirectory = directory+'/'+rule.id;
    const rulesDirectory = rulesetDirectory + '/rules';
    mkdirp.sync(rulesDirectory);
    const rawMetaFilename = `${rulesetDirectory}/${rule.id}.raw-meta.yaml`;
    saveYaml(rule, rawMetaFilename);
    report.push({
      id: rule.id,
      rawMetaFilename: rawMetaFilename,
      rulesets: []
    })
    rule.sources.forEach(sourceRule => {
      let format;
      if(sourceRule.version === '2.0'){
        format = 'swagger';
      }
      else {
        format = 'openapi';
      }
      const version = sourceRule.version.replace('.','');
      const ruleFilename = `${rulesDirectory}/${rule.id}.${format}-${version}.spectral-v6.yaml`;
      saveRuleset(sourceRule.sourceRule.rule, rule.id, ruleFilename);
      report[report.length-1].rulesets.push({
        id: sourceRule.slug,
        filename:  ruleFilename
      });
    });
  });
  return report;
}