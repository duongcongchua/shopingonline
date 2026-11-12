
import axios from 'axios';
import React, { Component } from 'react';

class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      name: '',
      phone: '',
      email: '',
      loading: false,
      message: ''
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const {
      username,
      password,
      name,
      phone,
      email
    } = this.state;

    if (!username || !password || !name || !phone || !email) {
      alert('Please complete all fields');
      return;
    }

    this.setState({ loading: true, message: '' });

    try {
      const res = await axios.post(
        '/api/customer/signup',
        { username, password, name, phone, email }
      );

      this.setState({
        message: res.data.message,
        loading: false
      });

      if (res.data.success) {
        alert('Registration successful! Please check your email.');
      }
    } catch (error) {
      console.error(error);
      this.setState({
        loading: false,
        message: 'Registration failed'
      });
    }
  };

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">SIGN-UP</h2>

        <form onSubmit={this.handleSubmit}>
          <table>
            <tbody>
              {[
                ['username', 'Username', 'text'],
                ['password', 'Password', 'password'],
                ['name', 'Name', 'text'],
                ['phone', 'Phone', 'tel'],
                ['email', 'Email', 'email']
              ].map(([key, label, type]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>
                    <input
                      required
                      type={type}
                      name={key}
                      value={this.state[key]}
                      onChange={this.handleChange}
                    />
                  </td>
                </tr>
              ))}

              <tr>
                <td></td>
                <td>
                  <button
                    type="submit"
                    disabled={this.state.loading}
                  >
                    {this.state.loading
                      ? 'SENDING EMAIL...'
                      : 'SIGN-UP'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {this.state.message && (
          <p className="text-center">
            {this.state.message}
          </p>
        )}
      </div>
    );
  }
}

export default Signup;
