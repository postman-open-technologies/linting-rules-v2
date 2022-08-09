import fs from 'fs';
import yaml from 'js-yaml';
import glob from 'glob';
import {resolve} from 'path';

export function loadYaml(filename) {
  const fileContents = fs.readFileSync(filename, 'utf8');
  const data = yaml.load(fileContents);
  return data;
}

export function listFiles(pattern) {
  const paths = glob.sync(pattern);
  // Turning relative path in absolute ones
  const absolutePaths = paths.map(path => resolve(path));
  return absolutePaths;
}
