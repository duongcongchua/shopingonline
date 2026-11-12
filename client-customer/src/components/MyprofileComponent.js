
import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';

import MyContext from '../contexts/MyContext';

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      loading: false,
      message: ''
    };
  }

  componentDidMount() {
    this.loadCustomer();
  }

  loadCustomer = () => {
    const customer = this.context.customer;

    if (!customer) return;

    this.setState({
      txtUsername: customer.username || '',
      txtPassword: '',
      txtName: customer.name || '',
      txtPhone: customer.phone || '',
      txtEmail: customer.email || ''
    });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  btnUpdateClick = async (e) => {
    e.preventDefault();

    const { customer, token } = this.context;

    if (!customer || !token) {
      return;
    }

    const profile = {
      username: this.state.txtUsername.trim(),
      password: this.state.txtPassword,
      name: this.state.txtName.trim(),
      phone: this.state.txtPhone.trim(),
      email: this.state.txtEmail.trim()
    };

    if (
      !profile.username ||
      !profile.name ||
      !profile.phone ||
      !profile.email
    ) {
      this.setState({
        message: 'Please input all required fields'
      });
      return;
    }

    this.setState({
      loading: true,
      message: ''
    });

    try {
      const res = await axios.put(
        '/api/customer/customers/' + customer._id,
        profile,
        {
          headers: {
            'x-access-token': token
          }
        }
      );

      const result = res.data;

      if (result.success) {
        this.context.setCustomer(result.customer);
        this.context.setToken(result.token);

        this.setState({
          txtPassword: '',
          message: 'Profile updated successfully'
        });
      } else {
        this.setState({
          message: result.message
        });
      }
    } catch (error) {
      console.error(error);

      this.setState({
        message:
          error.response?.data?.message ||
          'Update failed'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    if (!this.context.token ||
        !this.context.customer) {
      return <Navigate replace to="/login" />;
    }

    return (
      <div className="align-center">
        <h2 className="text-center">
          MY PROFILE
        </h2>

        <form onSubmit={this.btnUpdateClick}>
          <table>
            <tbody>
              <tr>
                <td>Username</td>
                <td>
                  <input
                    required
                    type="text"
                    name="txtUsername"
                    value={this.state.txtUsername}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>

              <tr>
                <td>New Password</td>
                <td>
                  <input
                    type="password"
                    name="txtPassword"
                    placeholder="Leave blank to keep old password"
                    value={this.state.txtPassword}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>

              <tr>
                <td>Name</td>
                <td>
                  <input
                    required
                    type="text"
                    name="txtName"
                    value={this.state.txtName}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>

              <tr>
                <td>Phone</td>
                <td>
                  <input
                    required
                    type="tel"
                    name="txtPhone"
                    value={this.state.txtPhone}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>

              <tr>
                <td>Email</td>
                <td>
                  <input
                    required
                    type="email"
                    name="txtEmail"
                    value={this.state.txtEmail}
                    onChange={this.handleChange}
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
                      ? 'UPDATING...'
                      : 'UPDATE'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {this.state.message && (
          <p>{this.state.message}</p>
        )}
      </div>
    );
  }
}

export default Myprofile;
