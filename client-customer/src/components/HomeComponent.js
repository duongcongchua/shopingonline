
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const getImageSrc = (image) => {
  if (!image) return '';

  return image.startsWith('data:')
    ? image
    : 'data:image/jpeg;base64,' + image;
};

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newprods: [],
      hotprods: [],
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetProducts();
  }

  apiGetProducts = async () => {
    try {
      const [newRes, hotRes] = await Promise.all([
        axios.get('/api/customer/products/new'),
        axios.get('/api/customer/products/hot')
      ]);

      this.setState({
        newprods: newRes.data,
        hotprods: hotRes.data,
        error: ''
      });
    } catch (error) {
      console.error(error);

      this.setState({
        error: 'Cannot load products'
      });
    }
  };

  renderProducts(products) {
    return products.map((item) => (
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
    ));
  }

  render() {
    const { newprods, hotprods, error } = this.state;

    return (
      <div className="customer-home">
        <div className="align-center">
          <h2 className="text-center">
            NEW PRODUCTS
          </h2>

          {this.renderProducts(newprods)}

          {newprods.length === 0 && (
            <p className="text-center">
              No products available
            </p>
          )}
        </div>

        {hotprods.length > 0 && (
          <div className="align-center">
            <h2 className="text-center">
              HOT PRODUCTS
            </h2>

            {this.renderProducts(hotprods)}
          </div>
        )}

        {error && (
          <p className="text-center" style={{ color: 'red' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
}

export default Home;
