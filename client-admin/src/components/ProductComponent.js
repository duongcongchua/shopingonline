
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null,
      selectedVersion: 0,
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetProducts(1);
  }

  getConfig = () => {
    return {
      headers: {
        'x-access-token': this.context.token
      }
    };
  };

  apiGetProducts = async (page) => {
    try {
      const res = await axios.get(
        '/api/admin/products?page=' + page,
        this.getConfig()
      );

      this.setState({
        products: res.data.products,
        noPages: res.data.noPages,
        curPage: res.data.curPage,
        error: ''
      });
    } catch (error) {
      console.error(error);
      this.setState({
        error: 'Cannot load products'
      });
    }
  };

  lnkPageClick = (page) => {
    this.setState({ itemSelected: null });
    this.apiGetProducts(page);
  };

  trItemClick = (item) => {
    this.setState((prev) => ({
      itemSelected: item,
      selectedVersion: prev.selectedVersion + 1
    }));
  };

  handleSaved = async () => {
    await this.apiGetProducts(this.state.curPage);

    this.setState((prev) => ({
      itemSelected: null,
      selectedVersion: prev.selectedVersion + 1
    }));
  };

  render() {
    const {
      products,
      noPages,
      curPage,
      itemSelected,
      selectedVersion,
      error
    } = this.state;

    const pagination = Array.from(
      { length: noPages },
      (_, index) => {
        const page = index + 1;

        return (
          <span key={page} style={{ margin: '0 5px' }}>
            {page === curPage ? (
              <b>{page}</b>
            ) : (
              <button
                type="button"
                onClick={() => this.lnkPageClick(page)}
              >
                {page}
              </button>
            )}
          </span>
        );
      }
    );

    return (
      <div className="product-management">
        <div className="product-list">
          <h2 className="text-center">
            PRODUCT LIST
          </h2>

          <table className="datatable" border="1">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Creation date</th>
                <th>Category</th>
                <th>Image</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => {
                const imageSrc = item.image
                  ? item.image.startsWith('data:')
                    ? item.image
                    : 'data:image/jpeg;base64,' + item.image
                  : '';

                return (
                  <tr
                    key={item._id}
                    onClick={() => this.trItemClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{item._id}</td>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td>
                      {item.cdate
                        ? new Date(item.cdate).toLocaleString()
                        : ''}
                    </td>
                    <td>{item.category?.name || ''}</td>
                    <td>
                      {imageSrc && (
                        <img
                          src={imageSrc}
                          width="90"
                          height="90"
                          style={{ objectFit: 'contain' }}
                          alt={item.name}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="text-center">
            {pagination}
          </div>

          {error && (
            <p style={{ color: 'red' }}>{error}</p>
          )}
        </div>

        <ProductDetail
          item={itemSelected}
          selectedVersion={selectedVersion}
          onSaved={this.handleSaved}
        />
      </div>
    );
  }
}

export default Product;
