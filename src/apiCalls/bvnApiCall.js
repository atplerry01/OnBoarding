import Axios from 'axios';

export default async (bvn) => {
  const url = `${process.env.REACT_APP_BVN_URL}${bvn}`;

  return Axios(url)
    .then((res) => res.data, (err) => err);
};
