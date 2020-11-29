import {
  ADD_CUSTOMER_DATA,
  UPDATE_GO_BACK_COUNT,
  RESET_INSTANCE_DATA
} from '../actions/customerDataActions';

const initState = {};

export default (state = initState, action) => {
  switch (action.type) {
  case ADD_CUSTOMER_DATA:
    console.log(action);
    return {
      ...state,
      ...action.payload
    };

  case UPDATE_GO_BACK_COUNT:
    return {
      ...state,
      goBackCount: action.payload
    };

  case RESET_INSTANCE_DATA:
    return initState;

  default:
    return state;
  }
};
