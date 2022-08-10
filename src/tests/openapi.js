function generateOpenApiVersion(versionValue) {
  let version;
  const normalizedVersionValue = getNormalizedVersionValue(versionValue);
  if(versionValue === "2.0") {
    version = { swagger: normalizedVersionValue}
  }
  else {
    version = { openapi: normalizedVersionValue}
  }

  return version;
}

function getNormalizedVersionValue(versionValue){
  const normalizedVersionValues = {
    '2.0': '2.0',
    '3.0': '3.0.3',
    '3.1': '3.1.0'
  };  
  const shortVersionValue = getShortVersionValue(versionValue);
  if(normalizedVersionValues.hasOwnProperty(shortVersionValue)){
    return normalizedVersionValues[shortVersionValue];
  }
  else {
    throw Exception(`Unsupported OpenAPI version ${versionValue}`);
  }
}

// Source: https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

// Supposed to be use with document that share the exact same structure
// between current version and target version
export function getDocumentWithVersion(document, version){
  // TODO use a more complete generator/converter?
  const versionProperty = generateOpenApiVersion(version);
  const content = {};
  for (const [key, value] of Object.entries(document)) {
    if(key !== 'openapi' && key !== 'swagger'){
      content[key] = deepCopy(value);
    }
  }
  const modified = {
    ...versionProperty,
    ...content
  }
  return modified;
}

export function getOpenApiVersionFromDocument(document) {
  let version;
  if(document.hasOwnProperty('openapi')){
   version = document.openapi;
  } 
  else {
    version = document.swagger;
  }
  return version;
}

export function getShortVersionValue(versionValue){
  return versionValue.substring(0,3);
}