
import axios from 'axios';
import React, { Component } from 'react';

class Active extends Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(
      window.location.search
    );

    this.state = {
      txtID: params.get('id') || '',
      txtToken: params.get('token') || '',
      message: '',
      loading: false
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const id = this.state.txtID.trim();
    const token = this.state.txtToken.trim();

    if (!id || !token) {
      alert('Please input ID and token');
      return;
    }

    this.setState({ loading: true });

    try {
      const res = await axios.post(
        '/api/customer/active',
        { id, token }
      );

      this.setState({
        loading: false,
        message: res.data.message
      });

      if (res.data.success) {
        alert('Account activated successfully!');
      }
    } catch (error) {
      console.error(error);
      this.setState({
        loading: false,
        message: 'Activation failed'
      });
    }
  };

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">
          ACTIVE ACCOUNT
        </h2>

        <form onSubmit={this.handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
                    onChange={(e) =>
                      this.setState({
                        txtID: e.target.value
                      })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>Token</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtToken}
                    onChange={(e) =>
                      this.setState({
                        txtToken: e.target.value
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
                    ACTIVE ACCOUNT
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

export default Active;
