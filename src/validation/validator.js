export const validator = (value, errorType) => {
  switch (errorType) {
  case 'isRequired':
    if (value === '') return `This field is required`;
    break;
  case 'isAlpha':
    if (value && !/^[a-zA-Z &'-]*$/.test(value)) return `Please enter only alphabets`;
    break;
  case 'isEmail':
    if (value && !/\S+@\S+\.\S+/.test(value)) return `Please enter a valid email`;
    break;
  case 'isBVN':
    if (value && !value.match(/^[0-9]{11}$/)) return `Please enter a valid BVN`;
    break;
  case 'isAccountNo':
    if (value && !value.match(/^[0-9]{10}$/)) return `Please enter a valid Account Number`;
    break;
  case 'isPhoneNo':
    if (value && !value.match(/^\d{11,}$/)) return `Please enter a valid Phone Number`;
    break;
  case 'isNotExpired':
    if (value && (new Date(value) < new Date())) return `Your card/permit has expired`;
    break;
  case 'isValidIssueDate':
    if (value && (new Date(value) > new Date())) return `Your issue date must not be greater than today`;
    break;
  default: break;
  }
  return null;
};

/**
 * function for validating a form field
 * @param {*} value field value to be validated
 * @param {string} errorType list of comma separated error types to validate the value against
 */
export const validateField = (value, errorType) => {
  const errorTypes = errorType.split(',').map((et) => et.trim());
  let errorMsg;
  for (let i = 0; i < errorTypes.length; i++) {
    errorMsg = validator(value, errorTypes[i]);
    if (errorMsg) break;
  }
  return errorMsg;
};

/**
 * function for validating a file
 * @param {object} fileInfo
 * @param {string} supportedTypes comma separated list of supported file types
 * @param {integer} maxSize maximum size of file in KB
 */
export const validateFile = (fileInfo, supportedTypes, maxSize, isRequired = false, fileString = '') => {
  if (!fileInfo) return isRequired && fileString.length < 5 ? 'No file is selected' : null;
  const st = supportedTypes.split(',').map((st) => st.trim());
  let { size, type } = fileInfo;

  type = type.slice(type.indexOf('/') + 1);
  size = size / 1024;
  if (!st.includes(type)) return `Invalid file type. Expecting ${supportedTypes}`;
  if (size > maxSize) return `File too large. Expecting file size below ${maxSize}KB`;
  return null;
};
