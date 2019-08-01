export default function calcTotalPrice(cart) {
  return cart.reduce((tally, cartItem) => {
    if (!cartItem.item) return tally
    return tally + cartItem.quantity * cartItem.item.price
  }, 0)
}

const calcTotalItems = cart => {
  return cart.reduce((tally, cartItem) => {
    if (!cartItem.item) return tally
    return tally + cartItem.quantity
  }, 0)
}

export { calcTotalItems }
