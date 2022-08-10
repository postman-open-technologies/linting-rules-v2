import * as OpenApiUtils from './openapi.js';

// TODO Put test stuff and sub-elements into one or more classes in that file
//export default class SpectralTest {
//}

// TODO add possibiliyies to have either hardcoded documents or a documentTemplate in schema
export function getAllVersionsOfDocument(givenOrThenTest, ruleTest) {
  let documents;
  if(givenOrThenTest.documentTemplate !== undefined){
    documents = [];
    ruleTest.versions.forEach(version => {
      documents.push({
        version: OpenApiUtils.getShortVersionValue(version),
        document: OpenApiUtils.getDocumentWithVersion(givenOrThenTest.documentTemplate, version)
      });
    });
  }
   else {
    documents = givenOrThenTest.documents;
  }
  return documents;
}

export function getRuleNames(rulesetTest) {
  return Object.keys(rulesetTest.rules);
}
