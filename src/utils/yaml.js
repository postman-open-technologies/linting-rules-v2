//import mkdirp from 'mkdirp';
import fs  from 'fs';
import yaml from 'js-yaml';

export function saveYaml(data, filename){
  let content = yaml.dump(data);
  fs.writeFileSync(filename, content, 'utf8');
}