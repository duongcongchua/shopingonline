
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

const MyConstants = require('../utils/MyConstants');
const EmailUtil = require('../utils/EmailUtil');

const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const OrderDAO = require('../models/OrderDAO');
const CustomerDAO = require('../models/CustomerDAO');

// =============================
// ADMIN AUTHENTICATION
// =============================

function requireAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';

    const token = req.headers['x-access-token'] ||
      (authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : '');

    if (!token) {
      return res.status(401).json({
        message: 'Admin token required'
      });
    }

    const decoded = jwt.verify(
      token,
      MyConstants.JWT_SECRET
    );

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired admin token'
    });
  }
}

// =============================
// LAB 02 - ADMIN LOGIN
// =============================

router.post('/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.json({
        success: false,
        message: 'Please input username and password'
      });
    }

    const admin =
      await AdminDAO.selectByUsernameAndPassword(
        username,
        password
      );

    if (!admin) {
      return res.json({
        success: false,
        message: 'Incorrect username or password'
      });
    }

    const token = jwt.sign(
      {
        username: admin.username,
        role: 'admin'
      },
      MyConstants.JWT_SECRET,
      {
        expiresIn: MyConstants.JWT_EXPIRES
      }
    );

    return res.json({
      success: true,
      message: 'Authentication successful',
      token
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

router.get('/token', requireAdmin, (req, res) => {
  return res.json({
    success: true,
    message: 'Admin token is valid'
  });
});

// =============================
// LAB 03 - CATEGORY
// =============================

router.get('/categories', requireAdmin, async (req, res) => {
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

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({
        message: 'Please input category name'
      });
    }

    const result = await CategoryDAO.insert({ name });
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot add category'
    });
  }
});

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({
        message: 'Please input category name'
      });
    }

    const result = await CategoryDAO.update({
      _id: req.params.id,
      name
    });

    if (!result) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'Cannot update category'
    });
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const result = await CategoryDAO.delete(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'Cannot delete category'
    });
  }
});

// =============================
// LAB 04 - PRODUCT
// =============================

router.get('/products', requireAdmin, async (req, res) => {
  try {
    const products = await ProductDAO.selectAll();

    const sizePage = 4;
    const noPages = Math.ceil(products.length / sizePage);
    const requestedPage = parseInt(req.query.page, 10) || 1;

    const curPage = Math.max(
      1,
      Math.min(requestedPage, noPages || 1)
    );

    const offset = (curPage - 1) * sizePage;

    return res.json({
      products: products.slice(offset, offset + sizePage),
      noPages,
      curPage
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot get products'
    });
  }
});

router.post('/products', requireAdmin, async (req, res) => {
  try {
    const { name, image, category } = req.body;
    const price = Number(req.body.price);

    if (
      !String(name || '').trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !image ||
      !category
    ) {
      return res.status(400).json({
        message: 'Invalid product information'
      });
    }

    const cate = await CategoryDAO.selectByID(category);

    if (!cate) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    const product = await ProductDAO.insert({
      name: String(name).trim(),
      price,
      image,
      category: cate,
      cdate: Date.now()
    });

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'Cannot add product'
    });
  }
});

router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { name, image, category } = req.body;
    const price = Number(req.body.price);

    if (
      !String(name || '').trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !image ||
      !category
    ) {
      return res.status(400).json({
        message: 'Invalid product information'
      });
    }

    const cate = await CategoryDAO.selectByID(category);

    if (!cate) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    const product = await ProductDAO.update({
      _id: req.params.id,
      name: String(name).trim(),
      price,
      image,
      category: cate
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'Cannot update product'
    });
  }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const result = await ProductDAO.delete(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'Cannot delete product'
    });
  }
});

// =============================
// ORDER - LIST & UPDATE STATUS
// =============================

router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await OrderDAO.selectAll();
    return res.json(orders);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Cannot get orders'
    });
  }
});

router.put('/orders/status/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    if (!['APPROVED', 'CANCELED'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status'
      });
    }

    const oldOrder = await OrderDAO.selectByID(id);

    if (!oldOrder) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (oldOrder.status !== 'PENDING') {
      return res.status(409).json({
        message: 'Only PENDING orders can be updated'
      });
    }

    const result = await OrderDAO.update(id, status);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Cannot update order status'
    });
  }
});

// =============================
// CUSTOMER MANAGEMENT
// =============================

router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const customers = await CustomerDAO.selectAll();
    return res.json(customers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot get customers'
    });
  }
});

router.get('/orders/customer/:cid', requireAdmin, async (req, res) => {
  try {
    const cid = req.params.cid;

    if (!mongoose.isValidObjectId(cid)) {
      return res.status(400).json({
        message: 'Invalid customer ID'
      });
    }

    const orders = await OrderDAO.selectByCustID(cid);
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot get customer orders'
    });
  }
});

router.put('/customers/deactive/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid customer ID'
      });
    }

    const existing = await CustomerDAO.selectByID(id);

    if (!existing) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const result = await CustomerDAO.deactive(id, token);

    const customer = result.toObject();
    delete customer.password;
    delete customer.token;

    return res.json({
      success: true,
      message: 'Customer deactivated successfully',
      customer
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Cannot deactivate customer'
    });
  }
});

router.get('/customers/sendmail/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await CustomerDAO.selectByID(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.active === 1) {
      return res.json({
        success: false,
        message: 'Customer is already active'
      });
    }

    let token = customer.token;

    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      await CustomerDAO.deactive(id, token);
    }

    const sent = await EmailUtil.send(
      customer.email,
      customer._id,
      token
    );

    return res.json({
      success: sent,
      message: sent
        ? 'Activation email submitted successfully'
        : 'Email sending failed'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Cannot send activation email'
    });
  }
});

module.exports = router;
