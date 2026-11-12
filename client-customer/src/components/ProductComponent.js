
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';

const getImageSrc = (image) => {
  if (!image) return '';

  return image.startsWith('data:')
    ? image
    : 'data:image/jpeg;base64,' + image;
};

class Product extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      loading: true,
      error: ''
    };
  }

  componentDidMount() {
    this.loadProducts();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.params.cid !== this.props.params.cid ||
      prevProps.params.keyword !== this.props.params.keyword
    ) {
      this.loadProducts();
    }
  }

  loadProducts = async () => {
    const { cid, keyword } = this.props.params;

    let url = '';

    if (cid) {
      url = '/api/customer/products/category/' + cid;
    } else if (keyword) {
      url =
        '/api/customer/products/search/' +
        encodeURIComponent(keyword);
    }

    if (!url) {
      this.setState({
        products: [],
        loading: false
      });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      const res = await axios.get(url);

      this.setState({
        products: res.data,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error(error);

      this.setState({
        products: [],
        loading: false,
        error: 'Cannot load products'
      });
    }
  };

  render() {
    const { products, loading, error } = this.state;

    return (
      <div className="text-center">
        <h2>LIST PRODUCTS</h2>

        {loading && <p>Loading products...</p>}

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        {!loading &&
          products.length === 0 &&
          !error && (
            <p>No products found</p>
          )}

        {products.map((item) => (
          <div key={item._id} className="inline">
            <figure>
              <Link to={'/product/' + item._id}>
                <img
                  src={getImageSrc(item.image)}
                  width="300"
                  height="300"
                  alt={item.name}
                />
              </Link>

              <figcaption className="text-center">
                {item.name}
                <br />
                Price: {item.price}
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    );
  }
}

export default withRouter(Product);
