/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { decodeToken } from '../utilities/authUtilities';

const ProtectedRoute = ({ component: Component, accessLevel, ...rest }) => {
  const ili = decodeToken('ili');
  const al = decodeToken('al');

  let access = al && al.accessLevels.filter((el) => el.moduleAccess === accessLevel);

  return (
    <Route
      {...rest}
      render={props => (ili && ili.isLoggedIn === 'true' ? (
        (access.length > 0 && <Component {...props} {...rest} />) ||
        (
          <Redirect
            to={{
              pathname: "/onboarding", state: { from: props.location }
            }}
          />
        )
      ) : (
        <Redirect
          to={{
            pathname: "/", state: { from: props.location }
          }}
        />
      ))}
    />
  );
};

export default ProtectedRoute;
