import { combineReducers } from 'redux';

import customerDataReducer from './customerDataReducer';

export default combineReducers({
  customerData: customerDataReducer
});
