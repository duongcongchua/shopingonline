
const Models = require('./Models');

const OrderDAO = {
  // LAB 07 - Thêm đơn hàng
  async insert(order) {
    return await Models.Order.create(order);
  },

  // LAB 07 - Lấy đơn hàng theo khách hàng
  async selectByCustID(cid) {
    const query = { 'customer._id': cid };

    return await Models.Order.find(query)
      .sort({ cdate: -1 })
      .exec();
  },

  // Lấy đơn hàng theo ID
  async selectByID(id) {
    return await Models.Order.findById(id).exec();
  },

  // Danh sách toàn bộ đơn hàng
  async selectAll() {
    const query = {};
    const mysort = { cdate: -1 };

    const orders = await Models.Order.find(query)
      .sort(mysort)
      .exec();

    return orders;
  },

  // Duyệt hoặc hủy đơn hàng
  async update(id, newStatus) {
    const newvalues = { status: newStatus };

    const result = await Models.Order.findByIdAndUpdate(
      id,
      newvalues,
      {
        new: true,
        runValidators: true
      }
    );

    return result;
  },

  // Tương thích với code Admin đã gửi trước đây
  async updateStatus(id, status) {
    return await this.update(id, status);
  }
};

module.exports = OrderDAO;
