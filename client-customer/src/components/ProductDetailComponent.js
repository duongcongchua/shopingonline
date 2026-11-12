
import axios from 'axios';
import React, { Component } from 'react';

import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';

const getImageSrc = (image) => {
  if (!image) return '';

  return image.startsWith('data:')
    ? image
    : 'data:image/jpeg;base64,' + image;
};

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      product: null,
      txtQuantity: 1,
      loading: true,
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetProduct(this.props.params.id);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.id !== this.props.params.id) {
      this.apiGetProduct(this.props.params.id);
    }
  }

  apiGetProduct = async (id) => {
    this.setState({
      loading: true,
      error: '',
      txtQuantity: 1
    });

    try {
      const res = await axios.get(
        '/api/customer/products/' + id
      );

      this.setState({
        product: res.data,
        loading: false
      });
    } catch (error) {
      console.error(error);

      this.setState({
        product: null,
        loading: false,
        error: 'Cannot get product details'
      });
    }
  };

  btnAdd2CartClick = (e) => {
    e.preventDefault();

    const product = this.state.product;
    const quantity = Number(this.state.txtQuantity);

    if (!product) {
      alert('Product not found');
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      alert('Please input quantity from 1 to 99');
      return;
    }

    const mycart = [...this.context.mycart];

    const index = mycart.findIndex(
      (item) => item.product._id === product._id
    );

    if (index === -1) {
      mycart.push({
        product,
        quantity
      });
    } else {
      const newQuantity =
        mycart[index].quantity + quantity;

      if (newQuantity > 99) {
        alert('Maximum quantity is 99');
        return;
      }

      mycart[index] = {
        ...mycart[index],
        quantity: newQuantity
      };
    }

    this.context.setMycart(mycart);

    alert('Added to cart successfully!');
  };

  render() {
    const {
      product,
      loading,
      error,
      txtQuantity
    } = this.state;

    if (loading) {
      return (
        <p className="text-center">
          Loading product...
        </p>
      );
    }

    if (error || !product) {
      return (
        <p className="text-center">
          {error || 'Product not found'}
        </p>
      );
    }

    return (
      <div className="align-center">
        <h2 className="text-center">
          PRODUCT DETAILS
        </h2>

        <figure className="caption-right">
          <img
            src={getImageSrc(product.image)}
            width="400"
            height="400"
            alt={product.name}
          />

          <figcaption>
            <form onSubmit={this.btnAdd2CartClick}>
              <table>
                <tbody>
                  <tr>
                    <td align="right">ID:</td>
                    <td>{product._id}</td>
                  </tr>

                  <tr>
                    <td align="right">Name:</td>
                    <td>{product.name}</td>
                  </tr>

                  <tr>
                    <td align="right">Price:</td>
                    <td>{product.price}</td>
                  </tr>

                  <tr>
                    <td align="right">Category:</td>
                    <td>
                      {product.category?.name || ''}
                    </td>
                  </tr>

                  <tr>
                    <td align="right">Quantity:</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={txtQuantity}
                        onChange={(e) =>
                          this.setState({
                            txtQuantity: e.target.value
                          })
                        }
                      />
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>
                      <button type="submit">
                        ADD TO CART
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </figcaption>
        </figure>
      </div>
    );
  }
}

export default withRouter(ProductDetail);
