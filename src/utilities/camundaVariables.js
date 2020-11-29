import moment from 'moment';
// import { getBase64ImageFromUrl } from "./ImageUtilities";

export const formatVariables = (objVariables, purpose = 'submit') => {
  const obj = objVariables;

  let variableSet = {};
  Object.entries(obj).forEach((entry) => {
    if (entry[0].includes('_zimg_') && entry[1] !== undefined && entry[1] !== '') {
      variableSet[entry[0]] = {
        value: entry[1].replace(/(data):(image)\/(jpeg|png|gif);(base64),/i, ''),
        type: "File",
        valueInfo: {
          filename: `${entry[0]}.${entry[1].slice(entry[1].indexOf('/') + 1, entry[1].indexOf(';'))}`,
          mimetype: entry[1].slice(entry[1].indexOf(':') + 1, entry[1].indexOf(';')),
          encoding: 'UTF-8'
        }
      };
      // delete the property from the variable set if the value is a url for downloading the image
      if (entry[1].includes('http://') || entry[1].includes('https://')) {
        Reflect.deleteProperty(variableSet, entry[0]);
      }
    } else if (entry[0].includes('startDate')) {
      variableSet[entry[0]] = { value: entry[1].replace(/:00$/g, '00'), type: "Date", valueInfo: {} };
    } else {
      variableSet[entry[0]] = { value: entry[1] || '' };
    }
    // delete the goBackCount property from the variable set
    if (entry[0] === 'goBackCount') {
      Reflect.deleteProperty(variableSet, entry[0]);
    }
  });
  const varName = purpose === 'submit' ? 'variables' : 'modifications';
  return { [varName]: variableSet };
};

export const convertToObj = (variables, pii = null) => {
  let objVariables = {};
  Object.entries(variables).forEach((prop) => {
    objVariables[prop[0]] = prop[1].value && prop[1].value.toString().replace(/"/g, '');
    if (objVariables[prop[0]] == null) {
      objVariables[prop[0]] = '';
    }
    if (objVariables[prop[0]] && objVariables[prop[0]].match(/\d{2}-\w{3}-\d{2}/i)) {
      let date = moment(objVariables[prop[0]], 'DD-MMM-YY').format('YYYY-MM-DD');
      let year = date.slice(0, 4);
      if (Number(year) > new Date().getFullYear()) year -= 100;
      objVariables[prop[0]] = date.replace(/\d{4}/, year);
    }
    if (objVariables[prop[0]] && objVariables[prop[0]].match(/\d{2}\/\d{2}\/\d{4}/i)) {
      objVariables[prop[0]] = moment(objVariables[prop[0]], 'MM/DD/YYYY').format('YYYY-MM-DD');
    }
    if (prop[1].type === 'File' && prop[1].valueInfo && prop[1].valueInfo.filename) {
      const baseUrl = process.env.REACT_APP_CAMUNDA_BASE_URL;
      const imageUrl = `${baseUrl}/process-instance/${pii}/variables/${prop[0]}/data`;
      objVariables[prop[0]] = imageUrl; // await getBase64ImageFromUrl(imageUrl);
      // Reflect.deleteProperty(objVariables, prop[0]);
    }
  });
  return objVariables;
};
