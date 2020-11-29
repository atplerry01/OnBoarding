import jwt from 'jsonwebtoken';

import { logout } from '../apiCalls/authApi';
import notification from './notification';

export const encodeToken = (name, payload) => {
  const token = jwt.sign(payload, process.env.REACT_APP_JWT_SECRET);

  localStorage.setItem(name, token);
};

/**
 * this function decodes the token value for the name supplied if it exists
 * @param {string} tokenName
 */
export const decodeToken = (tokenName) => {
  try {
    const item = localStorage.getItem(tokenName);
    if (!item) {
      logout();
      return null;
    }
    return jwt.verify(item, process.env.REACT_APP_JWT_SECRET);
  } catch (err) {
    console.log(err);
    logout();
  }
  return null;
};

/**
 * this function checks the response from an API call to know if the user is unauthorized.
 * It logs the user out if he/she is unauthorized.
 * @param {object} res response from the API call
 */
export const checkUnauthorized = (res) => {
  if (res && res.status === 401) {
    logout();
    notification({
      title: 'Session Expired',
      message: 'Your session has expired. Please, re-login to have access to the portal.',
      type: 'danger'
    });
  }
};
