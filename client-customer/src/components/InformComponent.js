
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import MyContext from '../contexts/MyContext';

class Inform extends Component {
  static contextType = MyContext;

  lnkLogoutClick = () => {
    this.context.logout();
    this.context.setMycart([]);
  };

  render() {
    const { token, customer, mycart } = this.context;

    const loggedIn = Boolean(
      token && customer
    );

    return (
      <div className="border-bottom">
        <div className="float-left">
          {!loggedIn ? (
            <div>
              <Link to="/login">
                Login
              </Link>
              {' | '}
              <Link to="/signup">
                Sign-up
              </Link>
              {' | '}
              <Link to="/active">
                Active
              </Link>
            </div>
          ) : (
            <div>
              Hello <b>{customer.name}</b>
              {' | '}
              <Link
                to="/home"
                onClick={this.lnkLogoutClick}
              >
                Logout
              </Link>
              {' | '}
              <Link to="/myprofile">
                My profile
              </Link>
              {' | '}
              <Link to="/myorders">
                My orders
              </Link>
            </div>
          )}
        </div>

        <div className="float-right">
          <Link to="/mycart">
            My cart
          </Link>
          {' '}have{' '}
          <b>{mycart.length}</b>
          {' '}items
        </div>

        <div className="float-clear"></div>
      </div>
    );
  }
}

export default Inform;
