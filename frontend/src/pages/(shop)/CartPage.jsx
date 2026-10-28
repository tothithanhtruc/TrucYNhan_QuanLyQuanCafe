import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import PublicLayout from "../../layouts/PublicLayout";
import {
  CART_UPDATED_EVENT,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../../utils/cart";
import { formatCurrency, resolveProductImage } from "../../utils/format";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const syncCart = () => {
      const nextCart = getCart();
      setCart(nextCart);
      setSelectedIds((ids) =>
        ids.filter((id) =>
          nextCart.some((item) => String(item.id) === String(id))
        )
      );
    };

    syncCart();
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const allSelected = cart.length > 0 && selectedIds.length === cart.length;
  const selectedItems = useMemo(
    () =>
      cart.filter((item) =>
        selectedIds.some((id) => String(id) === String(item.id))
      ),
    [cart, selectedIds]
  );
  const selectedTotal = selectedItems.reduce(
    (total, item) => total + Number(item.price || 0) * item.quantity,
    0
  );

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : cart.map((item) => item.id));
  };

  const toggleItem = (id) => {
    setSelectedIds((ids) =>
      ids.some((itemId) => String(itemId) === String(id))
        ? ids.filter((itemId) => String(itemId) !== String(id))
        : [...ids, id]
    );
  };

  const changeQuantity = (item, quantity) => {
    updateCartItemQuantity(item.id, quantity);
  };

  const deleteItem = (id) => {
    removeFromCart(id);
    setSelectedIds((ids) =>
      ids.filter((itemId) => String(itemId) !== String(id))
    );
  };

  return (
    <PublicLayout>
      <div className="border-b border-stone-200 bg-[#f7f5f2] py-3">
        <div className="mx-auto max-w-7xl px-4 text-sm text-stone-500">
          <Link to="/" className="hover:text-amber-800">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Giỏ hàng</span>
        </div>
      </div>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-8 text-3xl font-bold text-stone-900">Giỏ hàng</h1>

          {cart.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-[#f8f6f2] px-6 py-16 text-center">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-amber-800" />
              <h2 className="mb-2 text-xl font-bold text-stone-800">
                Giỏ hàng đang trống
              </h2>
              <p className="mb-6 text-stone-500">
                Hãy chọn một sản phẩm yêu thích để bắt đầu mua sắm.
              </p>
              <Link
                to="/shop"
                className="inline-flex rounded-lg bg-amber-800 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
              >
                Tiếp tục mua hàng
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="overflow-hidden rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3 border-b border-stone-200 bg-[#f8f6f2] px-5 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-amber-800"
                    aria-label="Chọn tất cả sản phẩm"
                  />
                  <span className="text-sm font-semibold text-stone-700">
                    Chọn tất cả ({cart.length} sản phẩm)
                  </span>
                </div>

                <div className="divide-y divide-stone-200">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-4 p-5 sm:flex-nowrap"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.some(
                          (id) => String(id) === String(item.id)
                        )}
                        onChange={() => toggleItem(item.id)}
                        className="h-4 w-4 accent-amber-800"
                        aria-label={`Chọn ${item.name}`}
                      />
                      <Link
                        to={`/products/${item.id}`}
                        className="h-24 w-24 shrink-0 rounded-lg bg-[#f8f6f2] p-2"
                      >
                        <img
                          src={resolveProductImage(item.image, item.id)}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/products/${item.id}`}
                          className="font-semibold text-stone-800 hover:text-amber-800"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-amber-800">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center overflow-hidden rounded border border-stone-300">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 border-x border-stone-300 px-2 py-2 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item, item.quantity + 1)}
                          disabled={item.quantity >= Number(item.stock)}
                          className="p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <strong className="w-28 text-right text-amber-800">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </strong>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-stone-400 transition hover:text-red-600"
                        aria-label={`Xóa ${item.name}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="h-fit rounded-2xl border border-stone-200 bg-[#f8f6f2] p-6">
                <h2 className="mb-5 text-xl font-bold text-stone-800">Tóm tắt đơn hàng</h2>
                <div className="mb-4 flex justify-between text-sm text-stone-600">
                  <span>Sản phẩm đã chọn</span>
                  <span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="mb-6 flex justify-between border-t border-stone-300 pt-4">
                  <span className="font-bold text-stone-800">Tổng tiền</span>
                  <span className="text-xl font-bold text-amber-800">{formatCurrency(selectedTotal)}</span>
                </div>
                <button
                  type="button"
                  disabled={selectedItems.length === 0}
                  className="w-full rounded-lg bg-amber-800 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tiến hành đặt hàng
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
