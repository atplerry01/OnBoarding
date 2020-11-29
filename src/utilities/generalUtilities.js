import getJson from '../apiCalls/jsonFilesCall';

export const getCountryName = async (abbr) => {
  const countries = await getJson('world-countries.json');
  const country = countries.filter((item) => item.abbreviation === abbr)[0];

  return abbr && country && country.name;
};

export const getReligionName = async (code) => {
  const countries = await getJson('religions.json');
  const country = countries.filter((item) => item.code === code)[0];

  return code && country && country.name;
};
