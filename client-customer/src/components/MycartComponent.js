
import axios from 'axios';
import React, { Component } from 'react';

import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import withRouter from '../utils/withRouter';

const getImageSrc = (image) => {
  if (!image) return '';

  return image.startsWith('data:')
    ? image
    : 'data:image/jpeg;base64,' + image;
};

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      message: ''
    };
  }

  lnkRemoveClick = (id) => {
    const newCart = this.context.mycart.filter(
      (item) => item.product._id !== id
    );

    this.context.setMycart(newCart);
  };

  lnkCheckoutClick = async () => {
    const { mycart, customer, token } = this.context;

    if (mycart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!customer || !token) {
      alert('Please login before checkout');
      this.props.navigate('/login');
      return;
    }

    if (!window.confirm('ARE YOU SURE TO CHECKOUT?')) {
      return;
    }

    this.setState({
      loading: true,
      message: ''
    });

    try {
      const body = {
        total: CartUtil.getTotal(mycart),
        items: mycart,
        customer: customer
      };

      const config = {
        headers: {
          'x-access-token': token
        }
      };

      const res = await axios.post(
        '/api/customer/checkout',
        body,
        config
      );

      if (res.data.success) {
        this.context.setMycart([]);

        alert('Checkout successful!');

        this.props.navigate('/myorders');
      } else {
        this.setState({
          message:
            res.data.message || 'Checkout failed'
        });
      }
    } catch (error) {
      console.error(error);

      this.setState({
        message:
          error.response?.data?.message ||
          'Checkout failed'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const mycart = this.context.mycart;
    const total = CartUtil.getTotal(mycart);

    return (
      <div className="cart-page">
        <h2 className="text-center">
          ITEM LIST
        </h2>

        {mycart.length === 0 ? (
          <p className="text-center">
            Your cart is empty
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              className="datatable"
              border="1"
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {mycart.map((item, index) => (
                  <tr key={item.product._id}>
                    <td>{index + 1}</td>
                    <td>{item.product._id}</td>
                    <td>{item.product.name}</td>
                    <td>
                      {item.product.category?.name || ''}
                    </td>
                    <td>
                      <img
                        src={getImageSrc(item.product.image)}
                        width="70"
                        height="70"
                        style={{ objectFit: 'contain' }}
                        alt={item.product.name}
                      />
                    </td>
                    <td>{item.product.price}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.product.price * item.quantity}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          this.lnkRemoveClick(
                            item.product._id
                          )
                        }
                      >
                        REMOVE
                      </button>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan="6"></td>
                  <td><b>Total</b></td>
                  <td><b>{total}</b></td>
                  <td>
                    <button
                      type="button"
                      onClick={this.lnkCheckoutClick}
                      disabled={this.state.loading}
                    >
                      {this.state.loading
                        ? 'PROCESSING...'
                        : 'CHECKOUT'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {this.state.message && (
          <p
            className="text-center"
            style={{ color: 'red' }}
          >
            {this.state.message}
          </p>
        )}
      </div>
    );
  }
}

export default withRouter(Mycart);
