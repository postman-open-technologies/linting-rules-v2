//import mkdirp from 'mkdirp';
const fs = require('fs');
const yaml = require('js-yaml');

function saveYaml(data, filename){
  let content = yaml.dump(data);
  fs.writeFileSync(filename, content, 'utf8');
}

exports.saveYaml = saveYaml;