/* eslint-disable react/destructuring-assignment */
import React from 'react';

import bouncingLogo from '../../assets/preloaders/wema_spinner.gif';

export default (props) => (
  <div className="loading-overlay">
    <div className="inner-box">
      <img src={bouncingLogo} alt="bouncing Logo" />
      {props.message ? `${props.message}...` : 'Loading...'}
    </div>
  </div>
);
