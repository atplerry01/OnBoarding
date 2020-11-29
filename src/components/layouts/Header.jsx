import React from 'react';
import { Link } from 'react-router-dom';
import { MdPerson, MdExitToApp } from 'react-icons/md';

import { logout } from '../../apiCalls/authApi';
import { decodeToken } from '../../utilities/authUtilities';

import wemaLogo from '../../assets/images/WEMA_logo_full_500w.png';

const Header = (props) => {
  const dn = decodeToken('dn');
  return (
    <header>
      <div className="header-container">
        <div className="header-left">
          <Link className="logo" to="/"><img src={wemaLogo} alt="WEMA Bank Logo" /></Link>
        </div>
        <div className="header-right">
          {props.children}
          <div className="navbar-user-avatar-name">
            <div className="navbar-user-avatar">
              <MdPerson />
            </div>
            <span className="username">{dn.displayName}</span>
            <div className="navbar-user-menu">
              <div className="user-details">
                <div className="user-avatar-big">
                  <MdPerson />
                </div>
                <span className="username">{dn.displayName}</span>
              </div>
              <button
                type="button" className="clickable"
                onClick={() => logout()}>
                  Logout
                <MdExitToApp />
              </button>
              {/* <ul>
                <li><Link to="/" className="clickable">Profile</Link></li>
                <li><Link to="/" className="clickable">Setting</Link></li>
                <li>
                  <button
                    type="button" className="clickable"
                    onClick={() => handleLogoutBtn(props.history)}>
                      Logout
                  </button>
                </li>
              </ul> */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
