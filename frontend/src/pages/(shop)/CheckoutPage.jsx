import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { checkout } from "../../services/orderApi";
import { removeFromCart } from "../../services/cartApi";
import { formatCurrency, resolveProductImage } from "../../utils/format";
import { isLoggedIn } from "../../services/authApi";
import { getMyProfile } from "../../services/profileApi";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  User,
  Wallet,
  Banknote,
  Truck,
} from "lucide-react";

const PAYMENT_METHODS = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: Banknote },
  { id: "banking", label: "Chuyển khoản ngân hàng", icon: CreditCard },
  { id: "wallet", label: "Ví điện tử (MoMo, ZaloPay)", icon: Wallet },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  /* ─── Thông tin khách hàng (có thể chỉnh sửa) ─── */
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");

  useEffect(() => {
    // Đọc danh sách sản phẩm đã chọn từ sessionStorage
    const stored = sessionStorage.getItem("checkout-items");
    if (!stored) {
      navigate("/cart");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        navigate("/cart");
        return;
      }
      setItems(parsed);
    } catch {
      navigate("/cart");
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((response) => {
        if (!active) return;
        const profile = response.data?.data || response.data;
        setCustomerName(profile.fullName || "");
        setCustomerPhone(profile.phone || "");
        setDeliveryAddress(profile.address || "");
      })
      .catch((profileError) => {
        if (profileError.response?.status === 401) {
          navigate("/login", {
            state: {
              from: "/checkout",
              message: "Vui lòng đăng nhập để đặt hàng.",
            },
            replace: true,
          });
          return;
        }
        console.error("Lỗi tải thông tin người nhận:", profileError);
        setError("Không thể tải thông tin hồ sơ. Bạn vẫn có thể nhập thông tin nhận hàng.");
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  /* ─── Tính tổng ─── */
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  /* ─── Xử lý đặt hàng ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Vui lòng đăng nhập để đặt hàng.",
        },
        replace: true,
      });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await checkout({
        deliveryAddress: deliveryAddress.trim(),
        note:
          [
            `Tên: ${customerName.trim()}`,
            `SĐT: ${customerPhone.trim()}`,
            `Thanh toán: ${PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod}`,
            note.trim() || "",
          ]
            .filter(Boolean)
            .join(" | ") || null,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      setOrder(response.data?.data ?? response.data);

      // Xóa các sản phẩm đã đặt khỏi giỏ hàng
      items.forEach((item) => removeFromCart(item.id));
      sessionStorage.removeItem("checkout-items");
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate("/login", {
          state: {
            from: "/checkout",
            message:
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để đặt hàng.",
          },
          replace: true,
        });
        return;
      }

      console.error("Lỗi đặt hàng:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Không thể đặt hàng. Vui lòng kiểm tra lại và thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Đặt hàng thành công ─── */
  if (order) {
    return (
      <PublicLayout>
        <main className="mx-auto max-w-2xl px-4 py-16">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-emerald-900">
              Đặt hàng thành công!
            </h2>
            <p className="mb-1 text-stone-700">
              Mã đơn hàng:{" "}
              <strong className="text-emerald-800">{order.orderCode}</strong>
            </p>
            <p className="mb-6 text-stone-700">
              Đơn hàng đang chờ cửa hàng xác nhận. Tổng tiền:{" "}
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/shop"
                className="inline-flex rounded-lg bg-amber-800 px-5 py-3 text-sm font-bold text-white hover:bg-amber-900"
              >
                Tiếp tục mua sắm
              </Link>
              <Link
                to="/profile"
                className="inline-flex rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                Xem đơn hàng
              </Link>
            </div>
          </section>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-5xl px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-stone-500">
          <Link
            to="/cart"
            className="flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Giỏ hàng
          </Link>
          <span>/</span>
          <span className="font-semibold text-stone-800">Đặt hàng</span>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-stone-900">
          Thông tin đặt hàng
        </h1>

        {error && (
          <p
            className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
            role="alert"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* ─── Cột trái: Thông tin khách hàng ─── */}
            <div className="space-y-6">
              {/* Thông tin liên hệ */}
              <section className="rounded-2xl border border-stone-200 bg-white p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-stone-900">
                  <User className="h-5 w-5 text-amber-800" />
                  Thông tin người nhận
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nhập họ tên người nhận"
                      maxLength={100}
                      className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        Số điện thoại
                      </span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0901234567"
                      maxLength={15}
                      className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Địa chỉ giao hàng *
                      </span>
                    </label>
                    <textarea
                      required
                      maxLength={255}
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                      placeholder="Nhập địa chỉ nhận hàng đầy đủ"
                    />
                  </div>
                </div>
              </section>

              {/* Phương thức thanh toán */}
              <section className="rounded-2xl border border-stone-200 bg-white p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-stone-900">
                  <CreditCard className="h-5 w-5 text-amber-800" />
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                          paymentMethod === method.id
                            ? "border-amber-400 bg-amber-50"
                            : "border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="h-4 w-4 border-stone-300 text-amber-800 focus:ring-amber-800"
                        />
                        <Icon
                          className={`h-5 w-5 ${
                            paymentMethod === method.id
                              ? "text-amber-800"
                              : "text-stone-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            paymentMethod === method.id
                              ? "text-amber-900"
                              : "text-stone-700"
                          }`}
                        >
                          {method.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Ghi chú */}
              <section className="rounded-2xl border border-stone-200 bg-white p-6">
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  Ghi chú cho đơn hàng (không bắt buộc)
                </label>
                <textarea
                  maxLength={70}
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  placeholder="Ghi chú thêm cho cửa hàng..."
                />
              </section>
            </div>

            {/* ─── Cột phải: Đơn hàng ─── */}
            <div className="h-fit space-y-5 rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-stone-900">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              {/* Danh sách sản phẩm */}
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg bg-stone-50 p-3"
                  >
                    <img
                      src={resolveProductImage(item.image, item.id)}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg bg-white object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-bold text-stone-800">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tổng */}
              <div className="space-y-3 border-t border-stone-200 pt-4 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Phí vận chuyển
                  </span>
                  <span className="font-semibold text-emerald-600">
                    Miễn phí
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-amber-900">{formatCurrency(total)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full rounded-lg bg-amber-800 px-5 py-3.5 font-bold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </span>
                ) : (
                  `Xác nhận đặt hàng`
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </PublicLayout>
  );
}
