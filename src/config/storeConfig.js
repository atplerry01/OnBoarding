import { createStore } from 'redux';

import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';

import rootReducer from '../reducers';

const persistConfig = {
  key: 'root',
  storage
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(rootReducer, {});
export const persistedStore = createStore(persistedReducer, {});
export const persistor = persistStore(persistedStore);
