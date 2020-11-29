import React, { Component } from 'react';

import TextInput from '../components/inputFeilds/TextInput';
import { login } from '../apiCalls/authApi';
import notification from '../utilities/notification';
import { encodeToken } from '../utilities/authUtilities';

import wemaLogo from '../assets/images/WEMA-logo-white-250w.png';
import loginBtnSpinner from '../assets/preloaders/wema_spinner.gif';

class LoginPage extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      loading: false
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  }

  handleSubmit = async () => {
    const { username, password } = this.state;
    if (!(username && password)) {
      notification({
        title: 'Error',
        message: 'Please enter your username and password.',
        type: 'danger'
      });
    } else {
      this.setState({ loading: true });
      const res = await login({ username, password });

      if (res.status === 200) {
        if (res.data.accessLevels.length > 0) {
          notification({
            title: 'Successful',
            message: 'You have successfully logged in.',
            type: 'success'
          });
          encodeToken('un', { username: res.data.user.sAMAccountName });
          encodeToken('dn', { displayName: res.data.user.displayName });
          encodeToken('bc', { branchCode: res.data.scopeLevel.branchcode });
          encodeToken('jf', { jobFunction: res.data.accessLevels[0].jobFunction });
          encodeToken('al', { accessLevels: res.data.accessLevels });
          encodeToken('ili', { isLoggedIn: 'true' });
          console.log(res.data.accessLevels[0].jobFunction);
          this.props.history.push('/onboarding');
          return;
        } else {
          notification({
            title: 'Error',
            message: 'Unauthorized Access. Please, contact System Admin.',
            type: 'danger'
          });
        }
      } else if (String(res).includes('Network Error')) {
        notification({
          title: 'Network Error',
          message: 'Please, ensure you are connected to the internet.',
          type: 'danger'
        });
      } else if (String(res).includes('timeout')) {
        notification({
          title: 'Connection Timeout',
          message: 'Please, ensure your internet connection is stable.',
          type: 'danger'
        });
      } else {
        notification({
          title: 'Error',
          message: 'Invalid username and/or password.',
          type: 'danger'
        });
      }
      this.setState({ loading: false });
    }
  }

  handleKeyPress = (e) => {
    if (e.which === 13) {
      this.handleSubmit();
    }
  }

  render() {
    const { username, password, loading } = this.state;
    return (
      <div className="login-page">
        <div className="center-logo">
          <img src={wemaLogo} alt="Wema Logo" height="95" />
        </div>
        <div className="login-form">
          <div className="col-12">
            <h1>Log in</h1>
          </div>
          <TextInput
            label="Username" name="username" value={username}
            className="col-12" onChange={this.handleChange} onKeyPress={this.handleKeyPress} />
          <TextInput
            label="Password" name="password" value={password} type="password"
            className="col-12" onChange={this.handleChange} onKeyPress={this.handleKeyPress} />
          <div className="col-12">
            <button
              type="button" className="login-btn btn col-12"
              onClick={this.handleSubmit} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
              {loading && <img src={loginBtnSpinner} alt="Loading" />}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
