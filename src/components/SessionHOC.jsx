/* eslint-disable react/jsx-props-no-spreading */
import React, { Component } from 'react';
import notification from '../utilities/notification';

export default (ProtectedComponent) => class AutoLogout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      warningTime: 1000 * 60 * 10,
      signoutTime: 1000 * 60 * 15
    };
  }

  componentDidMount() {
    const events = [
      'load',
      'mousemove',
      'mousedown',
      'click',
      'scroll',
      'keypress'
    ];

    events.forEach((event) => {
      window.addEventListener(event, this.resetTimeout);
    });

    this.setTimeout();
  }

  clearTimeoutFunc = () => {
    if (this.warnTimeout) clearTimeout(this.warnTimeout);
    if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
  };

  setTimeout = () => {
    this.warnTimeout = setTimeout(this.warn, this.state.warningTime);
    this.logoutTimeout = setTimeout(this.logout, this.state.signoutTime);
  };

  resetTimeout = () => {
    this.clearTimeoutFunc();
    this.setTimeout();
  };

  warn = () => {
    notification({
      title: 'SESSION TIMEOUT WARNING',
      // eslint-disable-next-line max-len
      message: 'Due to inactivity on the portal, you will be logged out automatically in the next 5 minutes. To avoid being logged out, do something on the portal.',
      type: 'warning'
    });
  };

  logout = () => {
    // Send a logout request to the API
    console.log('Sending a logout request to the API...');
    localStorage.clear();
    window.location.assign('/');
    notification({
      title: 'SESSION TIMEOUT',
      message: 'Due to inactivity on the portal, your session has expired. Please, re-login to start a new session.',
      type: 'danger'
    });
  };

  render() {
    return (
      <div>
        <ProtectedComponent {...this.props} />
      </div>
    );
  }
};
