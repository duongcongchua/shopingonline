
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order: null,
      loading: true,
      updating: false,
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  trItemClick = (item) => {
    this.setState({
      order: item
    });
  };

  lnkApproveClick = (id) => {
    this.apiPutOrderStatus(id, 'APPROVED');
  };

  lnkCancelClick = (id) => {
    this.apiPutOrderStatus(id, 'CANCELED');
  };

  apiGetOrders = async () => {
    try {
      const config = {
        headers: {
          'x-access-token': this.context.token
        }
      };

      const res = await axios.get(
        '/api/admin/orders',
        config
      );

      const result = res.data;

      this.setState((prevState) => {
        const selected = prevState.order
          ? result.find(
              (item) =>
                item._id === prevState.order._id
            )
          : null;

        return {
          orders: result,
          order: selected || null,
          loading: false,
          error: ''
        };
      });
    } catch (error) {
      console.error('Get orders error:', error);

      this.setState({
        loading: false,
        error:
          error.response?.data?.message ||
          'Cannot get orders'
      });
    }
  };

  apiPutOrderStatus = async (id, status) => {
    if (this.state.updating) return;

    const confirmed = window.confirm(
      'Are you sure you want to ' +
      status +
      ' this order?'
    );

    if (!confirmed) return;

    this.setState({ updating: true });

    try {
      const body = {
        status: status
      };

      const config = {
        headers: {
          'x-access-token': this.context.token
        }
      };

      const res = await axios.put(
        '/api/admin/orders/status/' + id,
        body,
        config
      );

      if (res.data) {
        await this.apiGetOrders();
        alert('Order status updated successfully!');
      } else {
        alert('Update order status failed!');
      }
    } catch (error) {
      console.error('Update status error:', error);

      alert(
        error.response?.data?.message ||
        'Cannot update order status'
      );
    } finally {
      this.setState({ updating: false });
    }
  };

  render() {
    const {
      orders,
      order,
      loading,
      updating,
      error
    } = this.state;

    const orderRows = orders.map((item) => {
      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trItemClick(item)}
          style={{ cursor: 'pointer' }}
        >
          <td>{item._id}</td>

          <td>
            {new Date(item.cdate).toLocaleString()}
          </td>

          <td>{item.customer?.name || ''}</td>

          <td>{item.customer?.phone || ''}</td>

          <td>{item.total}</td>

          <td>{item.status}</td>

          <td>
            {item.status === 'PENDING' ? (
              <div>
                <button
                  type="button"
                  disabled={updating}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.lnkApproveClick(item._id);
                  }}
                >
                  APPROVE
                </button>

                {' || '}

                <button
                  type="button"
                  disabled={updating}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.lnkCancelClick(item._id);
                  }}
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <span>-</span>
            )}
          </td>
        </tr>
      );
    });

    const items = order
      ? order.items.map((item, index) => {
          const image = item.product.image || '';

          const imageSrc = image.startsWith('data:')
            ? image
            : 'data:image/jpeg;base64,' + image;

          return (
            <tr
              key={item.product._id + '-' + index}
              className="datatable"
            >
              <td>{index + 1}</td>

              <td>{item.product._id}</td>

              <td>{item.product.name}</td>

              <td>
                <img
                  src={imageSrc}
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
            </tr>
          );
        })
      : [];

    return (
      <div className="admin-management">
        <div className="align-center">
          <h2 className="text-center">
            ORDER LIST
          </h2>

          {loading && (
            <p>Loading orders...</p>
          )}

          {error && (
            <p style={{ color: 'red' }}>
              {error}
            </p>
          )}

          {!loading &&
            orders.length === 0 &&
            !error && (
              <p>No orders found</p>
            )}

          <div style={{ overflowX: 'auto' }}>
            <table className="datatable" border="1">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust. name</th>
                  <th>Cust. phone</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orderRows}
              </tbody>
            </table>
          </div>
        </div>

        {order && (
          <div
            className="align-center"
            style={{ marginTop: 30 }}
          >
            <h2 className="text-center">
              ORDER DETAIL
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table className="datatable" border="1">
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
                  {items}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Order;
