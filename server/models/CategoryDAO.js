
const Models = require('./Models');

const CategoryDAO = {

  // Lay tat ca danh muc
  async selectAll() {
    return await Models.Category.find({}).exec();
  },

  // Lay danh muc theo ID
  async selectByID(id) {
    return await Models.Category.findById(id).exec();
  },

  // Them danh muc
  async insert(category) {
    return await Models.Category.create(category);
  },

  // Cap nhat danh muc
  async update(category) {
    return await Models.Category.findByIdAndUpdate(
      category._id,
      {
        name: category.name
      },
      {
        new: true,
        runValidators: true
      }
    ).exec();
  },

  // Xoa danh muc
  async delete(id) {
    return await Models.Category.findByIdAndDelete(
      id
    ).exec();
  }

};

module.exports = CategoryDAO;
