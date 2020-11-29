import React from 'react';
import {
  Router, Route, Link, Switch
} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactNotifications from 'react-notifications-component';

import './App.css';
import LoginPage from './pages/LoginPage';
import Onboarding from './pages/Onboarding';

import Header from './components/layouts/Header';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  const history = createBrowserHistory();

  return (
    <Router history={history}>
      <div className="App">
        <ReactNotifications />
        <Switch>
          <Route path="/" exact component={LoginPage} />
          <ProtectedRoute path="/onboarding" component={Onboarding} accessLevel="FieldUser" />
          <ProtectedRoute
            path="/card-request"
            accessLevel="FieldUser"
            component={() => (
              <>
                <Header history={history}>
                  <Link className="header-right-link" to="/onboarding">Onboarding</Link>
                </Header>
                <h2>Card Request page</h2>
              </>
            )} />
          <Route render={() => <h1>Error 404. Page not found.</h1>} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
