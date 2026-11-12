
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      txtID: '',
      txtName: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      this.setState({
        txtID: this.props.item?._id || '',
        txtName: this.props.item?.name || ''
      });
    }
  }

  getConfig() {
    return {
      headers: {
        'x-access-token': this.context.token
      }
    };
  }

  async btnAddClick(e) {
    e.preventDefault();

    const name = this.state.txtName.trim();

    if (!name) {
      alert('Please input name');
      return;
    }

    try {
      await axios.post(
        '/api/admin/categories',
        { name },
        this.getConfig()
      );

      alert('Add category successful!');

      this.setState({
        txtID: '',
        txtName: ''
      });

      await this.props.updateCategories();
    } catch (error) {
      console.error(error);
      alert('Add category failed!');
    }
  }

  async btnUpdateClick(e) {
    e.preventDefault();

    const id = this.state.txtID;
    const name = this.state.txtName.trim();

    if (!id || !name) {
      alert('Please select a category and input name');
      return;
    }

    try {
      await axios.put(
        '/api/admin/categories/' + id,
        { name },
        this.getConfig()
      );

      alert('Update category successful!');
      await this.props.updateCategories();
    } catch (error) {
      console.error(error);
      alert('Update category failed!');
    }
  }

  async btnDeleteClick(e) {
    e.preventDefault();

    const id = this.state.txtID;

    if (!id) {
      alert('Please select a category');
      return;
    }

    if (!window.confirm('ARE YOU SURE?')) {
      return;
    }

    try {
      await axios.delete(
        '/api/admin/categories/' + id,
        this.getConfig()
      );

      alert('Delete category successful!');

      this.setState({
        txtID: '',
        txtName: ''
      });

      await this.props.updateCategories();
    } catch (error) {
      console.error(error);
      alert('Delete category failed!');
    }
  }

  render() {
    return (
      <div className="float-right">
        <h2 className="text-center">
          CATEGORY DETAIL
        </h2>

        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
                    readOnly
                  />
                </td>
              </tr>

              <tr>
                <td>Name</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) =>
                      this.setState({
                        txtName: e.target.value
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
                    value="ADD NEW"
                    onClick={(e) => this.btnAddClick(e)}
                  />

                  <input
                    type="submit"
                    value="UPDATE"
                    onClick={(e) => this.btnUpdateClick(e)}
                  />

                  <input
                    type="submit"
                    value="DELETE"
                    onClick={(e) => this.btnDeleteClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}

export default CategoryDetail;
