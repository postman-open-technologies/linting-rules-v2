import fs from 'fs';
import yaml from 'js-yaml';


function loadData(filename) {
  // Will add JSON Schema validation
  const fileContents = fs.readFileSync(filename, 'utf8');
  const data = yaml.load(fileContents);
  return data;
}

function generateOpenApiVersion(versionValue) {
  let version;
  if(versionValue === "2.0") {
    version = { swagger: versionValue}
  }
  else {
    version = { openapi: versionValue}
  }

  return version;
}

function getValue(list, options) {
  console.log('getValue', list, options);
  let value;
  if(options !== undefined){
    // not sure this will work that way, not using it for now
    value = list.find(item => item.name === options).value;
  }
  else {
    value = list.find(item => item.default).value;
  }
  return value;
}

function getValues(data, options = {}) {
  let result;
  if(typeof data === 'object') {
    result = {};
    for (const [key, value] of Object.entries(data)) {
      let property;
      let propertyValue;
      const multiValuesProperty = key.match(/^x-generator-values-(?<property>.*)$/);
      if(multiValuesProperty !== null){
        console.log('     => multiValuesProperty', multiValuesProperty.groups.property);
        property = multiValuesProperty.groups.property;
        propertyValue = getValue(value, options[property]);
      }
      else {
        console.log('     => regular property');
        property = key;
        propertyValue = getValues(value, options[property]);
      }
      console.log(`calc: ${property}: ${propertyValue}`);
      console.log('options', options[property]);
      if(options[property] !== false){
        result[property] = propertyValue;
      }
      else {
        console.log('not added because of options');
      }
    }
  }
  // Not tested, todo with servers
  else if(Array.isArray(data)){
    console.log('data is an array');
    result = [];
    data.forEach((item, index) => {
      let itemOptions;
      if(options !== undefined && index < options.length-1){
        itemOptions= options[index]
      }
      result.push(getValues(item, itemOptions));
    });
  }
  else {
    console.log('just a value', data);
    result = data;
  }
  return result;
}

function generateInfo(data, options) {
  return { info: getValues(data.info, options.info)}; 
}

function generatePaths(data, options) {
  return { paths: {} };
}

function generateCompleteOpenApiDocument(versionValue, data, options) {

  const version = generateOpenApiVersion(versionValue);
  const info = generateInfo(data, options);
  const paths = generatePaths(data.components);

  const document = {
    ...version,
    ...info,
    ...paths
  }

  return document;

}

function getOpenApiDocumentVersions(options) {
  let versions;
  if(options !== undefined) {
    if(options.hasOwnProperty('openapi')){
      if(Array.isArray(options.openapi)){
        versions = options.openapi;
      }
      else {
        versions = [options.openapi];
      }
    }
  }
  else {
    versions = ['3.0.3']; 
  }
  return versions;
}

function generateCompleteOpenApiDocuments(data, options){
  const requestedVersions = getOpenApiDocumentVersions(options);
  const documents = [];
  requestedVersions.forEach(version => {
    documents.push(generateCompleteOpenApiDocument(version, data, options));
  });
  return documents;
} 

const options = {
  openapi: ['2.0', '3.0.3'],
  info: {
    version: 'name',
    description: 'markdown with sections',
    contact: true,
    license: false,
    termsOfServices: false
  },
  components: {
    Book: {
      'x-generator-resource': [search]
    }
  }
}

const data = loadData('./source.yaml');
const documents = generateCompleteOpenApiDocuments(data, options);
console.log(JSON.stringify(documents, null, 2));
//const document = generateCompleteOpenApiDocument('3.0.3', data, options);
//console.log(JSON.stringify(document, null, 2));
