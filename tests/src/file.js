import fs from 'fs';
import yaml from 'js-yaml';

export function loadYaml(filename) {
  const fileContents = fs.readFileSync(filename, 'utf8');
  const data = yaml.load(fileContents);
  return data;
}