
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      txtUsername: '',
      txtPassword: '',
      error: '',
      loading: false
    };
  }

  render() {
    if (this.context.token !== '') {
      return null;
    }

    return (
      <div className="align-valign-center">
        <h2 className="text-center">ADMIN LOGIN</h2>

        <form onSubmit={this.btnLoginClick}>
          <table className="align-center">
            <tbody>
              <tr>
                <td>Username</td>
                <td>
                  <input
                    type="text"
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
                  <input
                    type="submit"
                    value={
                      this.state.loading
                        ? 'LOADING...'
                        : 'LOGIN'
                    }
                    disabled={this.state.loading}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {this.state.error && (
          <p
            className="text-center"
            style={{ color: 'red' }}
          >
            {this.state.error}
          </p>
        )}
      </div>
    );
  }

  btnLoginClick = (e) => {
    e.preventDefault();

    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;

    if (!username || !password) {
      this.setState({
        error: 'Please input username and password'
      });
      return;
    }

    this.apiLogin({ username, password });
  };

  async apiLogin(account) {
    this.setState({
      loading: true,
      error: ''
    });

    try {
      const res = await axios.post(
        '/api/admin/login',
        account
      );

      const result = res.data;

      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
      } else {
        this.setState({
          error: result.message
        });
      }
    } catch (error) {
      console.error(error);

      this.setState({
        error: 'Cannot connect to server!'
      });
    } finally {
      this.setState({
        loading: false
      });
    }
  }
}

export default Login;
