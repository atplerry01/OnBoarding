import React from 'react';
import { Provider } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';

// import { Link } from 'react-router-dom';
import OnboardingRoutes from '../routes/OnboardingRoutes';
import { /*store, */persistor, persistedStore } from '../config/storeConfig';

import Header from '../components/layouts/Header';
import Sidebar from '../components/layouts/Sidebar';

function Onboarding(props) {
  const { pathname } = props.history.location;
  return (
    <div className="onboarding">
      <Header history={props.history}>
        {/* <Link className="header-right-link" to="/onboarding">Dashboard</Link>
        <Link className="header-right-link" to="/card-request">Card Request</Link> */}
      </Header>
      <Provider store={persistedStore}>
        <PersistGate loading={<h1>Loading...</h1>} persistor={persistor}>
          <Sidebar history={props.history} pathname={pathname} />
          <div className="main-content">
            <OnboardingRoutes />
          </div>
        </PersistGate>
      </Provider>
      {/* using redux without persisting the store
       <Provider store={store}>
        <Sidebar history={props.history} pathname={pathname} />
        <div className="main-content">
          <OnboardingRoutes />
        </div>
      </Provider>
      */}
    </div>
  );
}

export default Onboarding;
