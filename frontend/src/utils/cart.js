const CART_STORAGE_KEY = "bickrost-cart";
export const CART_UPDATED_EVENT = "cart-updated";

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const getCart = () => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const storedCart = JSON.parse(storage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(storedCart) ? storedCart : [];
  } catch (error) {
    console.error("Không thể đọc giỏ hàng:", error);
    return [];
  }
};

const saveCart = (cart) => {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find((item) => String(item.id) === String(product.id));
  const nextQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;
  const stock = Number(product.stock);

  const item = {
    ...product,
    quantity: Number.isFinite(stock)
      ? Math.min(nextQuantity, Math.max(stock, 0))
      : nextQuantity,
  };

  const nextCart = existingItem
    ? cart.map((cartItem) =>
        String(cartItem.id) === String(product.id) ? item : cartItem
      )
    : [...cart, item];

  saveCart(nextCart.filter((cartItem) => cartItem.quantity > 0));
  return item;
};

export const updateCartItemQuantity = (id, quantity) => {
  const nextQuantity = Number(quantity);
  if (!Number.isInteger(nextQuantity) || nextQuantity < 1) return;

  const nextCart = getCart().map((item) => {
    if (String(item.id) !== String(id)) return item;
    const stock = Number(item.stock);
    return {
      ...item,
      quantity: Number.isFinite(stock)
        ? Math.min(nextQuantity, Math.max(stock, 1))
        : nextQuantity,
    };
  });

  saveCart(nextCart);
};

export const removeFromCart = (id) => {
  saveCart(getCart().filter((item) => String(item.id) !== String(id)));
};

export const getCartItemCount = () =>
  getCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
