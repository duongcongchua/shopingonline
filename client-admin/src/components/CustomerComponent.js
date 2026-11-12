
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

const getImageSrc = (image) => {
  if (!image) return '';

  return image.startsWith('data:')
    ? image
    : 'data:image/jpeg;base64,' + image;
};

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      customers: [],
      selectedCustomer: null,
      orders: [],
      selectedOrder: null,
      loading: true,
      loadingOrders: false,
      processing: false,
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  getConfig = () => ({
    headers: {
      'x-access-token': this.context.token
    }
  });

  // Lay danh sach Customer
  apiGetCustomers = async () => {
    try {
      const res = await axios.get(
        '/api/admin/customers',
        this.getConfig()
      );

      this.setState((prev) => {
        const selected = prev.selectedCustomer
          ? res.data.find(
              (item) =>
                item._id === prev.selectedCustomer._id
            )
          : null;

        return {
          customers: res.data,
          selectedCustomer: selected || null,
          loading: false,
          error: ''
        };
      });
    } catch (error) {
      console.error('Get customers error:', error);

      this.setState({
        loading: false,
        error:
          error.response?.data?.message ||
          'Cannot load customers'
      });
    }
  };

  // Khi click vao mot Customer
  trCustomerClick = async (customer) => {
    this.setState({
      selectedCustomer: customer,
      selectedOrder: null,
      orders: [],
      loadingOrders: true,
      error: ''
    });

    try {
      const res = await axios.get(
        '/api/admin/orders/customer/' + customer._id,
        this.getConfig()
      );

      this.setState({
        orders: res.data,
        loadingOrders: false
      });
    } catch (error) {
      console.error('Get customer orders:', error);

      this.setState({
        loadingOrders: false,
        error:
          error.response?.data?.message ||
          'Cannot get customer orders'
      });
    }
  };

  // Khi click vao mot Order
  trOrderClick = (order) => {
    this.setState({
      selectedOrder: order
    });
  };

  // LAB 09 - DEACTIVE
  lnkDeactiveClick = (customer) => {
    if (customer.active !== 1) {
      alert('Customer is already deactivated');
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to deactivate ' +
        customer.username +
        '?'
      )
    ) {
      return;
    }

    this.apiPutCustomerDeactive(customer._id);
  };

  apiPutCustomerDeactive = async (id) => {
    if (this.state.processing) return;

    this.setState({ processing: true });

    try {
      const res = await axios.put(
        '/api/admin/customers/deactive/' + id,
        {},
        this.getConfig()
      );

      if (res.data.success) {
        alert('Customer deactivated successfully!');

        await this.apiGetCustomers();
      } else {
        alert(
          res.data.message ||
          'Cannot deactivate customer'
        );
      }
    } catch (error) {
      console.error('Deactivate error:', error);

      alert(
        error.response?.data?.message ||
        'Deactivate failed'
      );
    } finally {
      this.setState({ processing: false });
    }
  };

  // LAB 09 - SEND MAIL
  lnkEmailClick = (customer) => {
    if (customer.active === 1) {
      alert('Customer account is already active');
      return;
    }

    if (
      !window.confirm(
        'Send activation email to ' +
        customer.email +
        '?'
      )
    ) {
      return;
    }

    this.apiGetCustomerSendmail(customer._id);
  };

  apiGetCustomerSendmail = async (id) => {
    if (this.state.processing) return;

    this.setState({ processing: true });

    try {
      const res = await axios.get(
        '/api/admin/customers/sendmail/' + id,
        this.getConfig()
      );

      alert(res.data.message);

      if (res.data.success) {
        await this.apiGetCustomers();
      }
    } catch (error) {
      console.error('Send mail error:', error);

      alert(
        error.response?.data?.message ||
        'Send activation email failed'
      );
    } finally {
      this.setState({ processing: false });
    }
  };

  render() {
    const {
      customers,
      selectedCustomer,
      orders,
      selectedOrder,
      loading,
      loadingOrders,
      processing,
      error
    } = this.state;

    return (
      <div className="admin-management">
        <h2 className="text-center">
          CUSTOMER LIST
        </h2>

        {loading && (
          <p className="text-center">
            Loading customers...
          </p>
        )}

        {error && (
          <p style={{ color: 'red' }}>
            {error}
          </p>
        )}

        <div className="table-wrapper">
          <table
            className="datatable"
            border="1"
            style={{ margin: '0 auto' }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((item) => (
                <tr
                  key={item._id}
                  onClick={() =>
                    this.trCustomerClick(item)
                  }
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedCustomer?._id === item._id
                        ? '#d4f1ff'
                        : undefined
                  }}
                >
                  <td>{item._id}</td>
                  <td>{item.username}</td>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.email}</td>

                  <td>{item.active}</td>

                  <td>
                    {item.active === 1 ? (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={(e) => {
                          e.stopPropagation();
                          this.lnkDeactiveClick(item);
                        }}
                      >
                        DEACTIVE
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={(e) => {
                          e.stopPropagation();
                          this.lnkEmailClick(item);
                        }}
                      >
                        EMAIL
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCustomer && (
          <div style={{ marginTop: 30 }}>
            <h2 className="text-center">
              ORDER LIST
            </h2>

            {loadingOrders && (
              <p className="text-center">
                Loading orders...
              </p>
            )}

            {!loadingOrders && orders.length === 0 && (
              <p className="text-center">
                Customer has no orders
              </p>
            )}

            {orders.length > 0 && (
              <div className="table-wrapper">
                <table
                  className="datatable"
                  border="1"
                  style={{ margin: '0 auto' }}
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
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        onClick={() =>
                          this.trOrderClick(order)
                        }
                        style={{
                          cursor: 'pointer'
                        }}
                      >
                        <td>{order._id}</td>

                        <td>
                          {new Date(
                            order.cdate
                          ).toLocaleString()}
                        </td>

                        <td>
                          {order.customer?.name}
                        </td>

                        <td>
                          {order.customer?.phone}
                        </td>

                        <td>{order.total}</td>
                        <td>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedOrder && (
          <div style={{ marginTop: 30 }}>
            <h2 className="text-center">
              ORDER DETAIL
            </h2>

            <div className="table-wrapper">
              <table
                className="datatable"
                border="1"
                style={{ margin: '0 auto' }}
              >
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Prod. ID</th>
                    <th>Product name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedOrder.items.map(
                    (item, index) => (
                      <tr
                        key={
                          item.product._id +
                          '-' +
                          index
                        }
                      >
                        <td>{index + 1}</td>

                        <td>
                          {item.product._id}
                        </td>

                        <td>
                          {item.product.name}
                        </td>

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

                        <td>
                          {item.product.price}
                        </td>

                        <td>{item.quantity}</td>

                        <td>
                          {item.product.price *
                            item.quantity}
                        </td>
                      </tr>
                    )
                  )}

                  <tr>
                    <td colSpan="6" align="right">
                      <b>TOTAL</b>
                    </td>

                    <td>
                      <b>{selectedOrder.total}</b>
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

export default Customer;
