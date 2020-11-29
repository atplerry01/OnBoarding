export const ADD_CUSTOMER_DATA = 'ADD_CUSTOMER_DATA';
export const UPDATE_GO_BACK_COUNT = 'UPDATE_GO_BACK_COUNT';
export const RESET_INSTANCE_DATA = 'RESET_INSTANCE_DATA';

export const addCustomerData = (customerData) => ({
  type: ADD_CUSTOMER_DATA,
  payload: customerData
});

export const updateGoBackCount = (newGoBackCount) => ({
  type: UPDATE_GO_BACK_COUNT,
  payload: newGoBackCount
});

export const resetInstanceData = () => ({
  type: RESET_INSTANCE_DATA
});
