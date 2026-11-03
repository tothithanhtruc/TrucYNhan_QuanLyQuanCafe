import { getCurrentUsername } from "./authApi";
import {
  getConfiguredUnitPrice,
  isCakeProduct,
} from "../utils/drinkCustomization";

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
    return cart.map((item, index) => {
      const basePrice = Number(item.basePrice ?? item.price ?? 0);
      const toppings = isCakeProduct(item)
        ? []
        : Array.isArray(item.toppings) ? item.toppings : [];
      return {
        ...item,
        cartLineId: item.cartLineId || `legacy-${item.id}-${index}`,
        basePrice,
        sugarLevel: isCakeProduct(item) ? "100%" : item.sugarLevel || "100%",
        iceLevel: isCakeProduct(item) ? "NORMAL" : item.iceLevel || "NORMAL",
        toppings,
        price: getConfiguredUnitPrice(basePrice, toppings),
      };
    });
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
  const isCake = isCakeProduct(product);
  const customization = {
    sugarLevel: isCake ? "100%" : product.sugarLevel || "100%",
    iceLevel: isCake ? "NORMAL" : product.iceLevel || "NORMAL",
    toppings: isCake ? [] : product.toppings || [],
  };
  const existingItem = cart.find((item) =>
    String(item.id) === String(product.id)
    && item.sugarLevel === customization.sugarLevel
    && item.iceLevel === customization.iceLevel
    && JSON.stringify([...item.toppings].sort()) === JSON.stringify([...customization.toppings].sort())
  );
  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;
  const quantityInOtherVariants = cart
    .filter((item) => String(item.id) === String(product.id) && item !== existingItem)
    .reduce((total, item) => total + item.quantity, 0);

  if (nextQuantity + quantityInOtherVariants > product.stock) {
    throw new Error("Số lượng đặt vượt quá tồn kho.");
  }

  const item = {
    id: product.id,
    name: product.name,
    image: product.image,
    categoryName: product.categoryName || product.category?.name || product.category || "",
    basePrice: Number(product.basePrice ?? product.price),
    price: getConfiguredUnitPrice(product.basePrice ?? product.price, customization.toppings),
    stock: product.stock,
    quantity: nextQuantity,
    ...customization,
    cartLineId: existingItem?.cartLineId || `line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  const updatedCart = existingItem
    ? cart.map((cartItem) => cartItem.cartLineId === existingItem.cartLineId ? item : cartItem)
    : [...cart, item];

  saveCart(updatedCart);
  return item;
}

export function updateCartQuantity(cartLineId, quantity) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.cartLineId === cartLineId);
  const quantityInOtherVariants = item
    ? cart
      .filter((cartItem) => String(cartItem.id) === String(item.id) && cartItem.cartLineId !== cartLineId)
      .reduce((total, cartItem) => total + cartItem.quantity, 0)
    : 0;
  if (
    !item
    || !Number.isInteger(quantity)
    || quantity < 1
    || quantity + quantityInOtherVariants > item.stock
  ) {
    throw new Error("Số lượng không hợp lệ hoặc vượt quá tồn kho.");
  }

  saveCart(cart.map((cartItem) => cartItem.cartLineId === cartLineId
    ? { ...cartItem, quantity }
    : cartItem));
}

export function updateCartCustomization(cartLineId, customization) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.cartLineId === cartLineId);
  if (!item) throw new Error("Không tìm thấy sản phẩm trong giỏ hàng.");

  saveCart(cart.map((cartItem) => cartItem.cartLineId === cartLineId
    ? {
      ...cartItem,
      ...customization,
      price: getConfiguredUnitPrice(item.basePrice, customization.toppings),
    }
    : cartItem));
}

export function removeFromCart(cartLineId) {
  saveCart(getCart().filter((item) => item.cartLineId !== cartLineId));
}

export function clearCart() {
  saveCart([]);
}

export function getCartItemCount() {
  return getCart().reduce((count, item) => count + item.quantity, 0);
}

export { CART_UPDATED_EVENT };
