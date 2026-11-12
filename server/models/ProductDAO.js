
const mongoose = require('mongoose');
const Models = require('./Models');

const ProductDAO = {
  // LAB 04 - Danh sách Product
  async selectAll() {
    return Models.Product.find({}).exec();
  },

  // Lấy sản phẩm theo ID
  async selectByID(id) {
    return Models.Product.findById(id).exec();
  },

  // LAB 04 - Thêm Product
  async insert(product) {
    return Models.Product.create(product);
  },

  // LAB 04 - Sửa Product
  async update(product) {
    return Models.Product.findByIdAndUpdate(
      product._id,
      {
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      },
      { new: true, runValidators: true }
    );
  },

  // LAB 04 - Xóa Product
  async delete(id) {
    return Models.Product.findByIdAndDelete(id);
  },

  // LAB 05 - Ba sản phẩm mới nhất
  async selectTopNew(top) {
    return Models.Product.find({})
      .sort({ cdate: -1 })
      .limit(top)
      .exec();
  },

  // LAB 05 - Sản phẩm bán chạy
  async selectTopHot(top) {
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product._id',
          sum: { $sum: '$items.quantity' }
        }
      },
      { $sort: { sum: -1 } },
      { $limit: top }
    ]);

    const products = [];

    for (const item of items) {
      const product = await Models.Product.findById(
        item._id
      );

      if (product) {
        products.push(product);
      }
    }

    return products;
  },

  // LAB 05 - Lọc sản phẩm theo Category
  async selectByCatID(cid) {
    const id = new mongoose.Types.ObjectId(cid);

    return Models.Product.find({
      'category._id': id
    }).exec();
  },

  // LAB 05 - Tìm kiếm sản phẩm
  async selectByKeyword(keyword) {
    const safeKeyword = keyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    return Models.Product.find({
      name: {
        $regex: safeKeyword,
        $options: 'i'
      }
    }).exec();
  }
};

module.exports = ProductDAO;
