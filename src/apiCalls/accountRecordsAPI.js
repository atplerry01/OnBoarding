import Axios from 'axios';

export const getCustomerAcctDocuments = async (accountNo) => {
  const url = `${process.env.REACT_APP_GET_DOC_URL}=${accountNo}`;

  console.log('Get Account Documents URL: ', url);

  return Axios(url)
    .then((res) => res.data, (err) => err);
};

export const uploadDocument = async (accountNo, key, value, SuitabilityStatus = '') => {
  const options = {
    url: process.env.REACT_APP_SAVE_DOC_URL,
    method: 'POST',
    data: {
      AccountNumber: accountNo,
      DocumentCategory: key,
      FileString: value,
      SuitabilityStatus
    }
  };

  return Axios(options)
    .then((res) => res.data, (err) => err);
};

export const getRcoComment = async (accountNo) => {
  const url = `${process.env.REACT_APP_GET_RCO_COMMENT_URL}=${accountNo}`;

  console.log('Get RCO Comment URL: ', url);

  return Axios(url)
    .then((res) => res.data, (err) => err);
};

export const postRcoComment = async (accountNo, comment, revStatus) => {
  const options = {
    url: process.env.REACT_APP_POST_RCO_COMMENT_URL,
    method: 'POST',
    data: {
      AccountNumber: accountNo,
      RcoComment: comment,
      ReviewStatus: revStatus
    }
  };

  return Axios(options)
    .then((res) => res.data, (err) => err);
};
