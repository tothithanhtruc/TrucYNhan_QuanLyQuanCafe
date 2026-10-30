import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { checkout } from "../../services/orderApi";
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../../services/cartApi";
import { formatCurrency, resolveProductImage } from "../../utils/format";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

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
    setCart(getCart());
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await checkout({
        deliveryAddress: deliveryAddress.trim(),
        note: note.trim() || null,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });
      setOrder(response.data?.data ?? response.data);
      clearCart();
      setCart([]);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate("/login", {
          state: {
            from: "/cart",
            message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để đặt hàng.",
          },
          replace: true,
        });
        return;
      }

      console.error("Lỗi đặt hàng:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Không thể đặt hàng. Vui lòng kiểm tra lại giỏ hàng và thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-stone-900">Giỏ hàng</h1>

        {order ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-emerald-900">Đặt hàng thành công</h2>
            <p className="mb-1 text-stone-700">Mã đơn hàng: {order.orderCode}</p>
            <p className="mb-6 text-stone-700">
              Đơn hàng đang chờ cửa hàng xác nhận. Tổng tiền:{" "}
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </p>
            <Link
              to="/shop"
              className="inline-flex rounded-lg bg-amber-800 px-5 py-3 text-sm font-bold text-white hover:bg-amber-900"
            >
              Tiếp tục mua sắm
            </Link>
          </section>
        ) : cart.length === 0 ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
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
            <section className="space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-stone-200 bg-white p-4"
                >
                  <img
                    src={resolveProductImage(item.image, item.id)}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg bg-stone-50 object-contain p-2"
                  />
                  <div className="min-w-36 flex-1">
                    <h2 className="font-semibold text-stone-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-amber-900">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-9 w-9 rounded border border-stone-300 disabled:opacity-40"
                      aria-label={`Giảm số lượng ${item.name}`}
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="h-9 w-9 rounded border border-stone-300 disabled:opacity-40"
                      aria-label={`Tăng số lượng ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm font-semibold text-rose-700 hover:text-rose-900"
                  >
                    Xóa
                  </button>
                </article>
              ))}
            </section>

            <form
              onSubmit={handleCheckout}
              className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="text-xl font-bold text-stone-900">Thông tin nhận hàng</h2>
              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
                  {error}
                </p>
              )}
              <label className="block text-sm font-semibold text-stone-700">
                Địa chỉ giao hàng
                <textarea
                  required
                  maxLength={255}
                  rows={3}
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-stone-300 p-3 font-normal"
                  placeholder="Nhập địa chỉ nhận hàng"
                />
              </label>
              <label className="block text-sm font-semibold text-stone-700">
                Ghi chú (không bắt buộc)
                <textarea
                  maxLength={255}
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-stone-300 p-3 font-normal"
                  placeholder="Ghi chú cho cửa hàng"
                />
              </label>
              <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
                <span>Tổng cộng</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-stone-500">Thanh toán khi nhận hàng.</p>
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full rounded-lg bg-amber-800 px-5 py-3 font-bold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
              </button>
            </form>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
