
import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';

import MyContext from '../contexts/MyContext';

const getImageSrc = (image) => {
  if (!image) return '';

  return image.startsWith('data:')
    ? image
    : 'data:image/jpeg;base64,' + image;
};

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order: null,
      loading: true,
      error: ''
    };
  }

  componentDidMount() {
    if (this.context.customer) {
      this.apiGetOrdersByCustID(
        this.context.customer._id
      );
    }
  }

  apiGetOrdersByCustID = async (cid) => {
    try {
      const config = {
        headers: {
          'x-access-token': this.context.token
        }
      };

      const res = await axios.get(
        '/api/customer/orders/customer/' + cid,
        config
      );

      this.setState({
        orders: res.data,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error(error);

      this.setState({
        loading: false,
        error: 'Cannot load orders'
      });
    }
  };

  trItemClick = (item) => {
    this.setState({
      order: item
    });
  };

  render() {
    if (
      !this.context.token ||
      !this.context.customer
    ) {
      return <Navigate replace to="/login" />;
    }

    const { orders, order, loading, error } =
      this.state;

    return (
      <div className="orders-page">
        <h2 className="text-center">
          ORDER LIST
        </h2>

        {loading && (
          <p className="text-center">
            Loading orders...
          </p>
        )}

        {error && (
          <p style={{ color: 'red' }}>
            {error}
          </p>
        )}

        {!loading && orders.length === 0 && !error && (
          <p className="text-center">
            You have no orders
          </p>
        )}

        {orders.length > 0 && (
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
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust. name</th>
                  <th>Cust. phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => this.trItemClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{item._id}</td>
                    <td>
                      {new Date(
                        item.cdate
                      ).toLocaleString()}
                    </td>
                    <td>{item.customer?.name}</td>
                    <td>{item.customer?.phone}</td>
                    <td>{item.total}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {order && (
          <div style={{ marginTop: 30 }}>
            <h2 className="text-center">
              ORDER DETAIL
            </h2>

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
                    <th>Prod. ID</th>
                    <th>Prod. name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map((item, index) => (
                    <tr
                      key={
                        item.product._id + '-' + index
                      }
                    >
                      <td>{index + 1}</td>

                      <td>{item.product._id}</td>

                      <td>{item.product.name}</td>

                      <td>
                        <img
                          src={getImageSrc(
                            item.product.image
                          )}
                          width="70"
                          height="70"
                          style={{
                            objectFit: 'contain'
                          }}
                          alt={item.product.name}
                        />
                      </td>

                      <td>{item.product.price}</td>

                      <td>{item.quantity}</td>

                      <td>
                        {item.product.price *
                          item.quantity}
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="6" align="right">
                      <b>TOTAL</b>
                    </td>
                    <td>
                      <b>{order.total}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Myorders;
