
const CartUtil = {

  getTotal(mycart) {
    return mycart.reduce((total, item) => {
      const price = Number(item.product.price);
      const quantity = Number(item.quantity);

      return total + price * quantity;
    }, 0);
  }

};

export default CartUtil;
