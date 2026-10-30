import { getCurrentUsername } from "./authApi";

const CART_UPDATED_EVENT = "cart-updated";

function getCartStorageKey() {
  const username = getCurrentUsername();
  return username ? `shopping-cart:${username}` : null;
}

function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCart() {
  const key = getCartStorageKey();
  if (!key) return [];

  const storedCart = localStorage.getItem(key);
  if (!storedCart) return [];

  try {
    const cart = JSON.parse(storedCart);
    if (!Array.isArray(cart)) throw new Error("Dữ liệu giỏ hàng không hợp lệ");
    return cart;
  } catch (error) {
    console.error("Không thể đọc giỏ hàng đã lưu:", error);
    localStorage.removeItem(key);
    return [];
  }
}

function saveCart(cart) {
  const key = getCartStorageKey();
  if (!key) throw new Error("Vui lòng đăng nhập để sử dụng giỏ hàng.");

  localStorage.setItem(key, JSON.stringify(cart));
  notifyCartUpdated();
}

export function addToCart(product, quantity) {
  const cart = getCart();
  const existingItem = cart.find((item) => String(item.id) === String(product.id));
  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (nextQuantity > product.stock) {
    throw new Error("Số lượng đặt vượt quá tồn kho.");
  }

  const item = {
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    stock: product.stock,
    quantity: nextQuantity,
  };
  const updatedCart = existingItem
    ? cart.map((cartItem) => String(cartItem.id) === String(product.id) ? item : cartItem)
    : [...cart, item];

  saveCart(updatedCart);
}

export function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((cartItem) => String(cartItem.id) === String(productId));
  if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > item.stock) {
    throw new Error("Số lượng không hợp lệ hoặc vượt quá tồn kho.");
  }

  saveCart(cart.map((cartItem) => String(cartItem.id) === String(productId)
    ? { ...cartItem, quantity }
    : cartItem));
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((item) => String(item.id) !== String(productId)));
}

export function clearCart() {
  saveCart([]);
}

export function getCartItemCount() {
  return getCart().reduce((count, item) => count + item.quantity, 0);
}

export { CART_UPDATED_EVENT };
