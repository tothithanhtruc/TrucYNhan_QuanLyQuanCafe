import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../../services/cartApi";

import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";

import { formatCurrency, resolveProductImage } from "../../utils/format";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const items = getCart();
    setCart(items);
    // Mặc định chọn tất cả
    setSelectedIds(new Set(items.map((item) => String(item.id))));
  }, []);

  /* ─── Checkbox helpers ─── */
  const toggleSelect = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const key = String(productId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cart.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.map((item) => String(item.id))));
    }
  };

  const isAllSelected = cart.length > 0 && selectedIds.size === cart.length;

  /* ─── Tính tổng tiền sản phẩm đã chọn ─── */
  const selectedItems = useMemo(
    () => cart.filter((item) => selectedIds.has(String(item.id))),
    [cart, selectedIds],
  );

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  const shippingFee = 0; // Miễn phí ship
  const total = subtotal + shippingFee;

  /* ─── Cart mutations ─── */
  const changeQuantity = (productId, quantity) => {
    try {
      updateCartQuantity(productId, quantity);
      setCart(getCart());
      setError("");
    } catch (cartError) {
      setError(cartError.message);
    }
  };

  const removeItem = (productId) => {
    removeFromCart(productId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(String(productId));
      return next;
    });
    setCart(getCart());
  };

  const removeSelected = () => {
    selectedIds.forEach((id) => removeFromCart(id));
    setSelectedIds(new Set());
    setCart(getCart());
  };

  /* ─── Đặt hàng → chuyển sang trang CheckoutPage ─── */
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
      return;
    }
    // Lưu danh sách sản phẩm đã chọn vào sessionStorage để trang Checkout đọc
    sessionStorage.setItem("checkout-items", JSON.stringify(selectedItems));
    navigate("/checkout");
  };

  return (
    <PublicLayout>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-stone-900">Giỏ hàng</h1>

        {cart.length === 0 ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-stone-300" />
            <p className="mb-5 text-stone-600">Giỏ hàng của bạn đang trống.</p>
            <Link
              to="/shop"
              className="inline-flex rounded-lg bg-amber-800 px-5 py-3 text-sm font-bold text-white hover:bg-amber-900"
            >
              Xem sản phẩm
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* ─── Danh sách sản phẩm ─── */}
            <section className="space-y-4">
              {/* Thanh chọn tất cả + xóa đã chọn */}
              <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-stone-300 text-amber-800 focus:ring-amber-800"
                  />
                  Chọn tất cả ({cart.length} sản phẩm)
                </label>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={removeSelected}
                    className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-900"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa đã chọn ({selectedIds.size})
                  </button>
                )}
              </div>

              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
                  {error}
                </p>
              )}

              {cart.map((item) => (
                <article
                  key={item.id}
                  className={`flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4 transition-colors ${
                    selectedIds.has(String(item.id))
                      ? "border-amber-300 bg-amber-50/30"
                      : "border-stone-200"
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(String(item.id))}
                    onChange={() => toggleSelect(item.id)}
                    className="h-4 w-4 rounded border-stone-300 text-amber-800 focus:ring-amber-800"
                  />

                  {/* Hình ảnh */}
                  {resolveProductImage(item.image, item.id) && (
                    <img
                      src={resolveProductImage(item.image, item.id)}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg bg-stone-50 object-contain p-2"
                    />
                  )}

                  {/* Thông tin sản phẩm */}
                  <div className="min-w-36 flex-1">
                    <h2 className="font-semibold text-stone-900">{item.name}</h2>
                    <p className="mt-1 text-sm font-bold text-amber-900">{formatCurrency(item.price)}</p>
                  </div>

                  {/* Số lượng */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                      aria-label={`Giảm số lượng ${item.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="flex h-9 w-9 items-center justify-center rounded border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                      aria-label={`Tăng số lượng ${item.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Thành tiền */}
                  <div className="min-w-24 text-right">
                    <p className="text-sm font-bold text-stone-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Xóa */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-sm font-semibold text-rose-700 hover:text-rose-900"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </section>

            {/* ─── Tóm tắt đơn hàng ─── */}
            <div className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="text-xl font-bold text-stone-900">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Phí vận chuyển
                  </span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-amber-900">{formatCurrency(total)}</span>
              </div>

              <p className="text-xs text-stone-500">
                Đã bao gồm miễn phí giao hàng toàn quốc.
              </p>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full rounded-lg bg-amber-800 px-5 py-3 font-bold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Đặt hàng ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
