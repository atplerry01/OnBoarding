import Axios from 'axios';

export const acctManagerConfirmation = async (staffId) => {
  const url = `${process.env.REACT_APP_ACCT_MGT_CONFIRM_URL}?StaffID=${staffId}`;

  return Axios(url)
    .then((res) => res.data, (err) => err);
};

export const relationManagerConfirmation = async (staffId) => {
  const url = `${process.env.REACT_APP_RELATION_MGT_CONFIRM_URL}?StaffID=${staffId}`;

  return Axios(url)
    .then((res) => res.data, (err) => err);
};

export const staffConfirmation = async (staffId) => {
  const url = `${process.env.REACT_APP_STAFF_ID_CONFIRM_URL}?StaffID=${staffId}`;

  return Axios(url)
    .then((res) => res.data, (err) => err);
};
