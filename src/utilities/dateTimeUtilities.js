import moment from 'moment';

const appendLeadZero = (val) => (Number(val) > 9 ? val : `0${val}`);

const DAYS = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'April',
  'May', 'June', 'July', 'Aug',
  'Sept', 'Oct', 'Nov', 'Dec'
];

/**
 * recieve a date value and return true if the date is today. Otherwise, false.
 * @param {String} date
 * @returns {Boolean}
 */
export const isToday = (date) => {
  const theDate = new Date(date);
  const today = new Date();
  return today.setHours(0, 0, 0, 0) === theDate.setHours(0, 0, 0, 0);
};

/**
 * recieve a date-time string and return date
 * @param {String} dateString
 * @returns {String} Format: Tues, 24 Sept 2019
 */
export const getDate = (dateString) => {
  const date = new Date(dateString);

  return `${date.getDate()}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
};

export const getTime = (dateString) => {
  const date = new Date(dateString);

  return `${date.toLocaleString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`;
};

export const getCurrentDateTime = (dateObj) => {
  const date = new Date(dateObj);
  const day = isToday(date) ? 'Today' :
    `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  return `${day}
  ${date.toLocaleString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`;
};

export const formatDateforPicker = (date, format = null) => {
  const d = new Date(date);
  if (format) {
    return moment(date, format).format('YYYY-MM-DD');
  }
  return `${d.getFullYear()}-${appendLeadZero(d.getMonth() + 1)}-${appendLeadZero(d.getDate())}`;
};

export const formatDobforPicker = (date, format) => {
  let d = moment(date, format).format('YYYY-MM-DD');
  let year = d.slice(0, 4);
  if (Number(year) > new Date().getFullYear()) year -= 100;
  return d.replace(/\d{4}/, year);
};

export const formatDateforCamunda = (date) => {
  const d = new Date(date);
  return `${appendLeadZero(d.getMonth() + 1)}/${appendLeadZero(d.getDate())}/${d.getFullYear()}`;
};

export const formatDate = (date) => {
  if (date.match(/\d{2}\/\d{2}\/\d{4}/)) {
    return moment(date, 'MM/DD/YYYY').format('MMMM Do YYYY');
  } else if (date.match(/\d{4}-\d{2}-\d{2}/)) {
    return moment(date, 'YYYY-MM-DD').format('MMMM Do YYYY');
  } else if (date.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}\+\d{4}/)) {
    return moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MMMM Do YYYY');
  } else return null;
};

export const isAgeGreater = (date, age) => {
  const today = moment().format('YYYY-MM-DD');

  return (moment(date).add(age, 'y').isBefore(today));
};

export const isAgeLesser = (date, age) => {
  const today = moment().format('YYYY-MM-DD');

  return (moment(date).add(age, 'y').isAfter(today));
};
