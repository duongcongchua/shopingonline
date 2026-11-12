
import axios from 'axios';
import React, { Component } from 'react';

import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      txtUsername: '',
      txtPassword: '',
      loading: false,
      message: ''
    };
  }

  btnLoginClick = async (e) => {
    e.preventDefault();

    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;

    if (!username || !password) {
      this.setState({
        message: 'Please input username and password'
      });
      return;
    }

    this.setState({
      loading: true,
      message: ''
    });

    try {
      const res = await axios.post(
        '/api/customer/login',
        {
          username,
          password
        }
      );

      const result = res.data;

      if (result.success) {
        this.context.setToken(result.token);
        this.context.setCustomer(result.customer);

        this.props.navigate('/home');
      } else {
        this.setState({
          message: result.message
        });
      }
    } catch (error) {
      console.error(error);

      this.setState({
        message: 'Cannot connect to server'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">
          CUSTOMER LOGIN
        </h2>

        <form onSubmit={this.btnLoginClick}>
          <table>
            <tbody>
              <tr>
                <td>Username</td>
                <td>
                  <input
                    type="text"
                    required
                    value={this.state.txtUsername}
                    onChange={(e) =>
                      this.setState({
                        txtUsername: e.target.value
                      })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>Password</td>
                <td>
                  <input
                    type="password"
                    required
                    value={this.state.txtPassword}
                    onChange={(e) =>
                      this.setState({
                        txtPassword: e.target.value
                      })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <button
                    type="submit"
                    disabled={this.state.loading}
                  >
                    {this.state.loading
                      ? 'LOGGING IN...'
                      : 'LOGIN'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {this.state.message && (
          <p style={{ color: 'red' }}>
            {this.state.message}
          </p>
        )}
      </div>
    );
  }
}

export default withRouter(Login);
