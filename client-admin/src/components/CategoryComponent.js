
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';

class Category extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      itemSelected: null,
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories = async () => {
    try {
      const config = {
        headers: {
          'x-access-token': this.context.token
        }
      };

      const res = await axios.get(
        '/api/admin/categories',
        config
      );

      this.setState({
        categories: res.data,
        error: ''
      });
    } catch (error) {
      console.error(error);
      this.setState({
        error: 'Cannot load categories'
      });
    }
  };

  trItemClick = (item) => {
    this.setState({
      itemSelected: item
    });
  };

  render() {
    const cates = this.state.categories.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trItemClick(item)}
        style={{ cursor: 'pointer' }}
      >
        <td>{item._id}</td>
        <td>{item.name}</td>
      </tr>
    ));

    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">
            CATEGORY LIST
          </h2>

          <table className="datatable" border="1">
            <tbody>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
              {cates}
            </tbody>
          </table>

          {this.state.error && (
            <p style={{ color: 'red' }}>
              {this.state.error}
            </p>
          )}
        </div>

        <div className="inline"></div>

        <CategoryDetail
          item={this.state.itemSelected}
          updateCategories={this.apiGetCategories}
        />

        <div className="float-clear"></div>
      </div>
    );
  }
}

export default Category;
