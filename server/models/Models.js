
const mongoose = require('mongoose');

// Admin
const AdminSchema = new mongoose.Schema({
  username: String,
  password: String
}, { versionKey: false });

// Category
const CategorySchema = new mongoose.Schema({
  name: String
}, { versionKey: false });

// Customer
const CustomerSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  phone: String,
  email: String,
  active: Number,
  token: String
}, { versionKey: false });

// Product
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  cdate: Number,
  category: CategorySchema
}, { versionKey: false });

// Order item
const ItemSchema = new mongoose.Schema({
  product: ProductSchema,
  quantity: Number
}, {
  versionKey: false,
  _id: false
});

// Order
const OrderSchema = new mongoose.Schema({
  cdate: Number,
  total: Number,
  status: String,
  customer: CustomerSchema,
  items: [ItemSchema]
}, { versionKey: false });

// MongoDB Models
const Admin = mongoose.model('Admin', AdminSchema);
const Category = mongoose.model('Category', CategorySchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

module.exports = {
  Admin,
  Category,
  Customer,
  Product,
  Order
};
