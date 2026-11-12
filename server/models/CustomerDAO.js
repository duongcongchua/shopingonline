
const Models = require('./Models');

const CustomerDAO = {

  // LAB 06 - Tim theo username hoac email
  async selectByUsernameOrEmail(username, email) {
    return Models.Customer.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    }).exec();
  },

  // LAB 06 - Dang nhap Customer
  async selectByUsernameAndPassword(username, password) {
    return Models.Customer.findOne({
      username: username,
      password: password
    }).exec();
  },

  // LAB 06 - Lay Customer theo ID
  async selectByID(id) {
    return Models.Customer.findById(id).exec();
  },

  // LAB 06 - Them Customer
  async insert(customer) {
    return Models.Customer.create(customer);
  },

  // LAB 06 - Kich hoat tai khoan
  async active(id, token, active) {
    return Models.Customer.findOneAndUpdate(
      {
        _id: id,
        token: token,
        active: 0
      },
      {
        active: active,
        token: ''
      },
      { new: true }
    ).exec();
  },

  // LAB 06 - Cap nhat thong tin ca nhan
  async update(customer) {
    const values = {
      username: customer.username,
      name: customer.name,
      phone: customer.phone,
      email: customer.email
    };

    if (customer.password) {
      values.password = customer.password;
    }

    return Models.Customer.findByIdAndUpdate(
      customer._id,
      values,
      {
        new: true,
        runValidators: true
      }
    ).exec();
  },

  // LAB 09 - Danh sach Customer
  async selectAll() {
    return Models.Customer.find({})
      .select('-password -token')
      .sort({ username: 1 })
      .exec();
  },

  // LAB 09 - Vo hieu hoa tai khoan
  async deactive(id, token) {
    return Models.Customer.findByIdAndUpdate(
      id,
      {
        active: 0,
        token: token
      },
      { new: true }
    ).exec();
  }

};

module.exports = CustomerDAO;
