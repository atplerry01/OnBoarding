import Axios from 'axios';

export const login = async ({ username, password }) => {
  const options = {
    url: process.env.REACT_APP_LOGIN_URL,
    method: 'POST',
    headers: { 'x-mock-match-request-body': true, 'Content-Type': 'application/json' },
    data: { username, password }
  };
  return Axios(options)
    .then((res) => res, (err) => err);
};

export const logout = async () => {
  localStorage.clear();
  window.location.assign('/');
};
