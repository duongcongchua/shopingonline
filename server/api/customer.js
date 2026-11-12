
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');

const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');
const MyConstants = require('../utils/MyConstants');

// Chỉ trả thông tin khách hàng không nhạy cảm
function safeCustomer(customer) {
  const result = customer.toObject();
  delete result.password;
  delete result.token;
  return result;
}

// Kiểm tra khách hàng sở hữu JWT
async function getAuthenticatedCustomer(req) {
  const authHeader = req.headers.authorization || '';
  const bearer = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : '';

  const token = req.headers['x-access-token'] || bearer;

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(
    token,
    MyConstants.JWT_SECRET
  );

  if (!decoded.username) {
    return null;
  }

  const customer = await CustomerDAO.selectByUsernameOrEmail(
    decoded.username,
    decoded.username
  );

  if (!customer || customer.active !== 1) {
    return null;
  }

  return customer;
}

// ==========================================
// LAB 05 - CATEGORIES & PRODUCTS
// ==========================================

router.get('/categories', async (req, res) => {
  try {
    const categories = await CategoryDAO.selectAll();
    return res.json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot get categories'
    });
  }
});

router.get('/products/new', async (req, res) => {
  try {
    const products = await ProductDAO.selectTopNew(3);
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot get new products'
    });
  }
});

router.get('/products/hot', async (req, res) => {
  try {
    const products = await ProductDAO.selectTopHot(3);
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot get hot products'
    });
  }
});

router.get('/products/category/:cid',
  async (req, res) => {
    try {
      const cid = req.params.cid;

      if (!mongoose.isValidObjectId(cid)) {
        return res.status(400).json({
          message: 'Invalid category ID'
        });
      }

      const products =
        await ProductDAO.selectByCatID(cid);

      return res.json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Cannot get category products'
      });
    }
  }
);

router.get('/products/search/:keyword',
  async (req, res) => {
    try {
      const products = await ProductDAO.selectByKeyword(
        req.params.keyword
      );

      return res.json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Cannot search products'
      });
    }
  }
);

router.get('/products/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      });
    }

    const product = await ProductDAO.selectByID(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot get product details'
    });
  }
});

// ==========================================
// LAB 06 - CUSTOMER SIGNUP
// ==========================================

router.post('/signup', async (req, res) => {
  try {
    const username = String(
      req.body.username || ''
    ).trim();

    const password = String(
      req.body.password || ''
    );

    const name = String(
      req.body.name || ''
    ).trim();

    const phone = String(
      req.body.phone || ''
    ).trim();

    const email = String(
      req.body.email || ''
    ).trim().toLowerCase();

    if (
      !username ||
      !password ||
      !name ||
      !phone ||
      !email
    ) {
      return res.json({
        success: false,
        message: 'Please input all fields'
      });
    }

    const existing =
      await CustomerDAO.selectByUsernameOrEmail(
        username,
        email
      );

    if (existing) {
      return res.json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const customer = await CustomerDAO.insert({
      username,
      password,
      name,
      phone,
      email,
      active: 0,
      token
    });

    const sent = await EmailUtil.send(
      email,
      customer._id,
      token
    );

    if (!sent) {
      return res.json({
        success: false,
        message:
          'Account created but activation email failed. ' +
          'Contact administrator.'
      });
    }

    return res.json({
      success: true,
      message: 'Please check your email'
    });
  } catch (error) {
    console.error('Signup error:', error);

    return res.status(500).json({
      success: false,
      message: 'Signup failed'
    });
  }
});

// ==========================================
// LAB 06 - ACTIVATE CUSTOMER
// ==========================================

router.post('/active', async (req, res) => {
  try {
    const id = String(req.body.id || '').trim();
    const token = String(req.body.token || '').trim();

    if (!mongoose.isValidObjectId(id) || !token) {
      return res.json({
        success: false,
        message: 'Invalid ID or token'
      });
    }

    const result = await CustomerDAO.active(
      id,
      token,
      1
    );

    if (!result) {
      return res.json({
        success: false,
        message: 'Invalid or used activation token'
      });
    }

    return res.json({
      success: true,
      message: 'Account activated successfully'
    });
  } catch (error) {
    console.error('Activation error:', error);

    return res.status(500).json({
      success: false,
      message: 'Activation failed'
    });
  }
});

// ==========================================
// LAB 06 - CUSTOMER LOGIN
// ==========================================

router.post('/login', async (req, res) => {
  try {
    const username = String(
      req.body.username || ''
    ).trim();

    const password = String(
      req.body.password || ''
    );

    if (!username || !password) {
      return res.json({
        success: false,
        message: 'Please input username and password'
      });
    }

    const customer =
      await CustomerDAO.selectByUsernameAndPassword(
        username,
        password
      );

    if (!customer) {
      return res.json({
        success: false,
        message: 'Incorrect username or password'
      });
    }

    if (customer.active !== 1) {
      return res.json({
        success: false,
        message: 'Account is not activated'
      });
    }

    const token = JwtUtil.genToken(customer.username);

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      customer: safeCustomer(customer)
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

router.get('/token', JwtUtil.checkToken,
  (req, res) => {
    return res.json({
      success: true,
      message: 'Token is valid'
    });
  }
);

// ==========================================
// LAB 06 - MY PROFILE
// ==========================================

router.put('/customers/:id',
  JwtUtil.checkToken,
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: 'Invalid customer ID'
        });
      }

      const authenticated =
        await getAuthenticatedCustomer(req);

      if (
        !authenticated ||
        String(authenticated._id) !== id
      ) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const username = String(
        req.body.username || ''
      ).trim();

      const password = String(
        req.body.password || ''
      );

      const name = String(
        req.body.name || ''
      ).trim();

      const phone = String(
        req.body.phone || ''
      ).trim();

      const email = String(
        req.body.email || ''
      ).trim().toLowerCase();

      if (!username || !name || !phone || !email) {
        return res.status(400).json({
          message: 'Please input all required fields'
        });
      }

      const duplicate =
        await CustomerDAO.selectByUsernameOrEmail(
          username,
          email
        );

      if (
        duplicate &&
        String(duplicate._id) !== id
      ) {
        return res.status(409).json({
          message: 'Username or email already exists'
        });
      }

      const updated = await CustomerDAO.update({
        _id: id,
        username,
        password,
        name,
        phone,
        email
      });

      if (!updated) {
        return res.status(404).json({
          message: 'Customer not found'
        });
      }

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        customer: safeCustomer(updated),
        token: JwtUtil.genToken(updated.username)
      });

    } catch (error) {
      console.error('Profile error:', error);

      return res.status(400).json({
        message: 'Profile update failed'
      });
    }
  }
);

// ==========================================
// LAB 07 - CHECKOUT
// ==========================================

router.post('/checkout',
  JwtUtil.checkToken,
  async (req, res) => {
    try {
      const customer =
        await getAuthenticatedCustomer(req);

      if (!customer) {
        return res.status(401).json({
          success: false,
          message: 'Please login as a customer'
        });
      }

      const items = req.body.items;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty'
        });
      }

      const orderItems = [];
      let total = 0;

      for (const item of items) {
        const productId = item?.product?._id;
        const quantity = Number(item.quantity);

        if (
          !mongoose.isValidObjectId(productId) ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 99
        ) {
          return res.status(400).json({
            success: false,
            message: 'Invalid cart item'
          });
        }

        const product =
          await ProductDAO.selectByID(productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'A product no longer exists'
          });
        }

        const price = Number(product.price);

        if (!Number.isFinite(price) || price < 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid product price'
          });
        }

        total += price * quantity;

        orderItems.push({
          product: product.toObject(),
          quantity
        });
      }

      const order = {
        cdate: Date.now(),
        total,
        status: 'PENDING',
        customer: customer.toObject(),
        items: orderItems
      };

      delete order.customer.password;
      delete order.customer.token;

      const result = await OrderDAO.insert(order);

      return res.json({
        success: true,
        message: 'Checkout successful',
        order: result
      });

    } catch (error) {
      console.error('Checkout error:', error);

      return res.status(500).json({
        success: false,
        message: 'Checkout failed'
      });
    }
  }
);

// ==========================================
// LAB 07 - MY ORDERS
// ==========================================

router.get('/orders/customer/:cid',
  JwtUtil.checkToken,
  async (req, res) => {
    try {
      const cid = req.params.cid;

      if (!mongoose.isValidObjectId(cid)) {
        return res.status(400).json({
          message: 'Invalid customer ID'
        });
      }

      const customer =
        await getAuthenticatedCustomer(req);

      if (
        !customer ||
        String(customer._id) !== cid
      ) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const orders = await OrderDAO.selectByCustID(
        customer._id
      );

      return res.json(orders);

    } catch (error) {
      console.error('My Orders error:', error);

      return res.status(500).json({
        message: 'Cannot get orders'
      });
    }
  }
);

module.exports = router;
    