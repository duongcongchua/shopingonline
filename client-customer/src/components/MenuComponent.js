
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';

class Menu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      txtKeyword: '',
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories = async () => {
    try {
      const response = await axios.get(
        '/api/customer/categories'
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid categories response');
      }

      this.setState({
        categories: response.data,
        error: ''
      });
    } catch (error) {
      console.error('Cannot load categories:', error);

      this.setState({
        categories: [],
        error: 'Cannot load categories'
      });
    }
  };

  btnSearchClick = (e) => {
    e.preventDefault();

    const keyword = this.state.txtKeyword.trim();

    if (!keyword) {
      alert('Please enter a keyword');
      return;
    }

    this.props.navigate(
      '/product/search/' +
      encodeURIComponent(keyword)
    );
  };

  render() {
    return (
      <div className="border-bottom">
        <div className="float-left">
          <ul className="menu">
            <li className="menu">
              <Link to="/home">Home</Link>
            </li>

            {this.state.categories.map((item) => (
              <li
                className="menu"
                key={item._id}
              >
                <Link
                  to={
                    '/product/category/' +
                    item._id
                  }
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {this.state.error && (
            <p style={{ color: 'red' }}>
              {this.state.error}
            </p>
          )}
        </div>

        <div className="float-right">
          <form
            className="search"
            onSubmit={this.btnSearchClick}
          >
            <input
              type="search"
              className="keyword"
              placeholder="Enter keyword"
              value={this.state.txtKeyword}
              onChange={(e) =>
                this.setState({
                  txtKeyword: e.target.value
                })
              }
            />

            <button type="submit">
              SEARCH
            </button>
          </form>
        </div>

        <div className="float-clear"></div>
      </div>
    );
  }
}

export default withRouter(Menu);
