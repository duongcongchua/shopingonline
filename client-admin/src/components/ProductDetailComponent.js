
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: '',
      cmbCategory: '',
      imgProduct: '',
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.item !== prevProps.item ||
      this.props.selectedVersion !== prevProps.selectedVersion
    ) {
      const item = this.props.item;

      this.setState({
        txtID: item?._id || '',
        txtName: item?.name || '',
        txtPrice: item?.price ?? '',
        cmbCategory:
          item?.category?._id ||
          this.state.categories[0]?._id ||
          '',
        imgProduct: item?.image
          ? item.image.startsWith('data:')
            ? item.image
            : 'data:image/jpeg;base64,' + item.image
          : '',
        error: ''
      });
    }
  }

  getConfig = () => ({
    headers: {
      'x-access-token': this.context.token
    }
  });

  apiGetCategories = async () => {
    try {
      const res = await axios.get(
        '/api/admin/categories',
        this.getConfig()
      );

      this.setState((prev) => ({
        categories: res.data,
        cmbCategory:
          prev.cmbCategory || res.data[0]?._id || ''
      }));
    } catch (error) {
      console.error(error);

      this.setState({
        error: 'Cannot load categories'
      });
    }
  };

  previewImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Please select a JPG, PNG or GIF image');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Please choose an image smaller than 3 MB');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      this.setState({
        imgProduct: event.target.result
      });
    };

    reader.readAsDataURL(file);
  };

  getProductData = () => {
    const {
      txtName,
      txtPrice,
      cmbCategory,
      imgProduct
    } = this.state;

    const price = Number(txtPrice);

    if (
      !txtName.trim() ||
      txtPrice === '' ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !cmbCategory ||
      !imgProduct
    ) {
      alert('Please input name, price, category and image');
      return null;
    }

    return {
      name: txtName.trim(),
      price,
      category: cmbCategory,
      image: imgProduct
    };
  };

  clearForm = () => {
    this.setState({
      txtID: '',
      txtName: '',
      txtPrice: '',
      cmbCategory: this.state.categories[0]?._id || '',
      imgProduct: '',
      error: ''
    });
  };

  btnAddClick = async (e) => {
    e.preventDefault();

    const product = this.getProductData();
    if (!product) return;

    try {
      await axios.post(
        '/api/admin/products',
        product,
        this.getConfig()
      );

      alert('Add product successful!');
      this.clearForm();
      await this.props.onSaved();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Add product failed'
      );
    }
  };

  btnUpdateClick = async (e) => {
    e.preventDefault();

    const id = this.state.txtID;

    if (!id) {
      alert('Please select a product');
      return;
    }

    const product = this.getProductData();
    if (!product) return;

    try {
      await axios.put(
        '/api/admin/products/' + id,
        product,
        this.getConfig()
      );

      alert('Update product successful!');
      this.clearForm();
      await this.props.onSaved();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Update product failed'
      );
    }
  };

  btnDeleteClick = async (e) => {
    e.preventDefault();

    const id = this.state.txtID;

    if (!id) {
      alert('Please select a product');
      return;
    }

    if (!window.confirm('ARE YOU SURE?')) {
      return;
    }

    try {
      await axios.delete(
        '/api/admin/products/' + id,
        this.getConfig()
      );

      alert('Delete product successful!');
      this.clearForm();
      await this.props.onSaved();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Delete product failed'
      );
    }
  };

  render() {
    return (
      <div className="product-detail">
        <h2 className="text-center">
          PRODUCT DETAIL
        </h2>

        <form onSubmit={(e) => e.preventDefault()}>
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
                <td>Price</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={this.state.txtPrice}
                    onChange={(e) =>
                      this.setState({
                        txtPrice: e.target.value
                      })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>Image</td>
                <td>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={this.previewImage}
                  />
                </td>
              </tr>

              <tr>
                <td>Category</td>
                <td>
                  <select
                    value={this.state.cmbCategory}
                    onChange={(e) =>
                      this.setState({
                        cmbCategory: e.target.value
                      })
                    }
                  >
                    <option value="">
                      Select category
                    </option>

                    {this.state.categories.map((cate) => (
                      <option
                        key={cate._id}
                        value={cate._id}
                      >
                        {cate.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <button
                    type="button"
                    onClick={this.btnAddClick}
                  >
                    ADD NEW
                  </button>

                  <button
                    type="button"
                    onClick={this.btnUpdateClick}
                  >
                    UPDATE
                  </button>

                  <button
                    type="button"
                    onClick={this.btnDeleteClick}
                  >
                    DELETE
                  </button>

                  <button
                    type="button"
                    onClick={this.clearForm}
                  >
                    CLEAR
                  </button>
                </td>
              </tr>

              <tr>
                <td colSpan="2">
                  {this.state.imgProduct && (
                    <img
                      src={this.state.imgProduct}
                      width="250"
                      height="250"
                      style={{ objectFit: 'contain' }}
                      alt="Product preview"
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {this.state.error && (
          <p style={{ color: 'red' }}>
            {this.state.error}
          </p>
        )}
      </div>
    );
  }
}

export default ProductDetail;
