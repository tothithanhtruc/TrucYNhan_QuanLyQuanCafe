import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { checkout } from "../../services/orderApi";
import { adminGetPromotions, getPromotionByCode } from "../../services/adminApi";
import { removeFromCart } from "../../services/cartApi";
import { createVNPayPaymentUrl, simulateVNPayPayment } from "../../services/paymentApi";
import { formatCurrency, resolveProductImage } from "../../utils/format";
import { isLoggedIn } from "../../services/authApi";
import { getMyProfile } from "../../services/profileApi";
import { getCustomizationSummary } from "../../utils/drinkCustomization";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  User,
  Wallet,
  Banknote,
  Truck,
  Copy,
  Check,
  ShieldCheck,
  Ticket,
  X,
  AlertCircle,
  Percent,
  Sparkles,
} from "lucide-react";

const BANK_OPTIONS = [
  { code: "NCB", name: "NCB - Ngân hàng TMCP Quốc Dân (Khuyên dùng Sandbox)" },
  { code: "VCB", name: "VCB - Ngân hàng Ngoại Thương (Vietcombank)" },
  { code: "TCB", name: "TCB - Ngân hàng Kỹ Thương (Techcombank)" },
  { code: "MB", name: "MB - Ngân hàng Quân Đội (MBBank)" },
  { code: "BIDV", name: "BIDV - Ngân hàng Đầu tư và Phát triển VN" },
  { code: "CTG", name: "CTG - Ngân hàng Công Thương (VietinBank)" },
  { code: "ACB", name: "ACB - Ngân hàng Á Châu (ACB)" },
  { code: "VPB", name: "VPB - Ngân hàng Việt Nam Thịnh Vượng (VPBank)" },
  { code: "TPB", name: "TPB - Ngân hàng Tiên Phong (TPBank)" },
  { code: "AGRIBANK", name: "AGRIBANK - Ngân hàng Nông nghiệp" }
];

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    subLabel: "Thanh toán bằng tiền mặt trực tiếp khi nhận hàng",
    icon: Banknote,
  },
  {
    id: "vnpay",
    label: "Thanh toán online qua VNPAY Sandbox",
    subLabel: "Thẻ ngân hàng NCB / ATM / VNPAY-QR (Môi trường test)",
    icon: CreditCard,
    badge: "Thử nghiệm ngay",
  },
  {
    id: "wallet",
    label: "Ví điện tử khác (MoMo / ZaloPay)",
    subLabel: "Chuyển khoản qua mã QR",
    icon: Wallet,
  },
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
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [vnpayBankCode, setVnpayBankCode] = useState("NCB");
  const [vnpayCardNumber, setVnpayCardNumber] = useState("9704198526191432198");
  const [vnpayCardHolder, setVnpayCardHolder] = useState("NGUYEN VAN A");
  const [vnpayIssueDate, setVnpayIssueDate] = useState("07/15");
  const [vnpayOtp, setVnpayOtp] = useState("123456");
  const [note, setNote] = useState("");

  /* ─── Khuyến mãi / Voucher ─── */
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [promotionsError, setPromotionsError] = useState("");

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

  useEffect(() => {
    let active = true;
    adminGetPromotions()
      .then((response) => {
        if (active) {
          setPromotions(response.data?.data || []);
        }
      })
      .catch((promotionError) => {
        console.error("Lỗi tải gợi ý voucher:", promotionError);
        if (active) {
          setPromotionsError("Không thể tải danh sách voucher gợi ý.");
        }
      })
      .finally(() => {
        if (active) {
          setPromotionsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  /* ─── Tính tổng & Giảm giá ─── */
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  let discountAmount = 0;
  if (appliedPromotion) {
    if (appliedPromotion.discountType === "PERCENT") {
      discountAmount = Math.round((subtotal * appliedPromotion.discountValue) / 100);
    } else {
      discountAmount = Number(appliedPromotion.discountValue) || 0;
    }
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  const shippingFee = 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const suggestedPromotions = promotions.filter((promo) => {
    if (promo.status !== 1) return false;
    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) return false;
    if (promo.endDate && new Date(promo.endDate) < now) return false;
    if (promo.quantity !== null && promo.quantity !== undefined && promo.quantity <= 0) {
      return false;
    }
    return true;
  });

  /* ─── Xử lý áp dụng mã khuyến mãi ─── */
  const handleApplyPromo = async (e, code = promoCodeInput) => {
    if (e) e.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setPromoError("Vui lòng nhập mã khuyến mãi");
      return;
    }

    setPromoCodeInput(normalizedCode);
    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const res = await getPromotionByCode(normalizedCode);
      const promo = res.data?.data;
      if (!promo) {
        setPromoError("Mã khuyến mãi không tồn tại.");
        return;
      }
      if (promo.status !== 1) {
        setPromoError("Mã khuyến mãi hiện đang tạm dừng áp dụng.");
        return;
      }
      const now = new Date();
      if (promo.startDate && new Date(promo.startDate) > now) {
        setPromoError("Mã khuyến mãi chưa tới thời gian áp dụng.");
        return;
      }
      if (promo.endDate && new Date(promo.endDate) < now) {
        setPromoError("Mã khuyến mãi đã hết hạn sử dụng.");
        return;
      }
      if (promo.quantity !== null && promo.quantity !== undefined && promo.quantity <= 0) {
        setPromoError("Mã khuyến mãi đã hết lượt sử dụng.");
        return;
      }
      if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
        setPromoError(
          `Đơn hàng cần đạt tối thiểu ${formatCurrency(promo.minOrderAmount)} để áp dụng mã này.`
        );
        return;
      }

      setAppliedPromotion(promo);
      setPromoSuccess(`Áp dụng mã "${promo.code}" thành công!`);
      setPromoError("");
    } catch (err) {
      setPromoError(
        err.response?.data?.message || "Mã khuyến mãi không hợp lệ hoặc đã hết hạn."
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromotion(null);
    setPromoCodeInput("");
    setPromoError("");
    setPromoSuccess("");
  };

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
      const paymentLabel = paymentMethod === "vnpay"
        ? `VNPAY Sandbox (${vnpayBankCode || "Tất cả ngân hàng"})`
        : PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod;

      const response = await checkout({
        deliveryAddress: deliveryAddress.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        promotionCode: appliedPromotion ? appliedPromotion.code : null,
        note:
          [
            `Tên: ${customerName.trim()}`,
            `SĐT: ${customerPhone.trim()}`,
            `Thanh toán: ${paymentLabel}`,
            appliedPromotion ? `Voucher: ${appliedPromotion.code}` : "",
            note.trim() || "",
          ]
            .filter(Boolean)
            .join(" | ") || null,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          sugarLevel: item.sugarLevel || "100%",
          iceLevel: item.iceLevel || "NORMAL",
          toppings: item.toppings || [],
        })),
      });

      const createdOrder = response.data?.data ?? response.data;

      // Xóa các sản phẩm đã đặt khỏi giỏ hàng
      items.forEach((item) => {
        if (item.cartLineId) removeFromCart(item.cartLineId);
      });
      sessionStorage.removeItem("checkout-items");

      // Nếu chọn thanh toán VNPAY -> tạo link thanh toán và redirect sang Cổng VNPAY Sandbox
      if (paymentMethod === "vnpay") {
        navigate(
          `/payment/vnpay-gateway?orderCode=${encodeURIComponent(
            createdOrder.orderCode
          )}&amount=${createdOrder.totalAmount}`
        );
        return;
      }

      setOrder(createdOrder);
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
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-emerald-900">
              Đặt hàng thành công!
            </h2>
            <p className="mb-1 text-stone-700">
              Mã đơn hàng:{" "}
              <strong className="text-emerald-800">{order.orderCode}</strong>
            </p>
            {order.promotionCode && (
              <p className="mb-1 text-sm text-amber-800 font-medium">
                Đã áp dụng mã khuyến mãi: <strong>{order.promotionCode}</strong> (Tiết kiệm {formatCurrency(order.discountAmount)})
              </p>
            )}
            <p className="mb-6 text-stone-700">
              Đơn hàng đang chờ cửa hàng xác nhận. Tổng thanh toán:{" "}
              <strong className="text-stone-900">{formatCurrency(order.totalAmount)}</strong>
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
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                paymentMethod === method.id
                                  ? "text-amber-900"
                                  : "text-stone-700"
                              }`}
                            >
                              {method.label}
                            </span>
                            {method.badge && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          {method.subLabel && (
                            <span className="text-xs text-stone-500 mt-0.5">
                              {method.subLabel}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Thông báo chuyển sang cổng VNPAY */}
                {paymentMethod === "vnpay" && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 animate-in fade-in space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                      <CreditCard className="h-4 w-4 text-blue-700" />
                      <span>Cổng thanh toán điện tử VNPAY Sandbox</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      Sau khi nhấn <strong>"Xác nhận đặt hàng"</strong>, hệ thống sẽ tự động chuyển bạn sang <strong>Trang Cổng VNPAY</strong> để chọn ngân hàng, nhập thông tin thẻ và mã OTP xác nhận thanh toán.
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>Môi trường thử nghiệm an toàn, không trừ tiền thật.</span>
                    </div>
                  </div>
                )}
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

            {/* ─── Cột phải: Đơn hàng & Voucher ─── */}
            <div className="h-fit space-y-5 rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-stone-900">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              {/* Danh sách sản phẩm */}
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.cartLineId || item.id}
                    className="flex items-center gap-3 rounded-lg bg-stone-50 p-3"
                  >
                    {resolveProductImage(item.image, item.id) && (
                      <img
                        src={resolveProductImage(item.image, item.id)}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg bg-white object-contain p-1"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                      <p className="text-xs text-stone-500">
                        {getCustomizationSummary(item)}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-bold text-stone-800">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ô nhập mã khuyến mãi / Voucher */}
              <div className="border-t border-stone-200 pt-4">
                <label className="mb-2 block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-amber-700" />
                  Mã khuyến mãi / Voucher
                </label>

                {!appliedPromotion ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã ưu đãi..."
                        value={promoCodeInput}
                        onChange={(e) =>
                          setPromoCodeInput(e.target.value.toUpperCase().replace(/\s+/g, ""))
                        }
                        className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm uppercase font-mono font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal focus:border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCodeInput.trim()}
                        className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-bold text-white hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50 transition"
                      >
                        {promoLoading ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          "Áp dụng"
                        )}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{promoError}</span>
                      </p>
                    )}
                    <div className="space-y-2 pt-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        Voucher gợi ý
                      </p>
                      {promotionsLoading ? (
                        <p className="text-xs text-stone-500">Đang tìm voucher phù hợp...</p>
                      ) : promotionsError ? (
                        <p className="text-xs text-rose-600" role="alert">
                          {promotionsError}
                        </p>
                      ) : suggestedPromotions.length === 0 ? (
                        <p className="text-xs text-stone-500">
                          Hiện chưa có voucher khả dụng. Bạn vẫn có thể nhập mã riêng.
                        </p>
                      ) : (
                        <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                          {suggestedPromotions.map((promo) => {
                            const meetsMinimum =
                              subtotal >= Number(promo.minOrderAmount || 0);
                            const amountNeeded = Math.max(
                              0,
                              Number(promo.minOrderAmount || 0) - subtotal,
                            );

                            return (
                              <div
                                key={promo.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-mono text-sm font-bold text-amber-900">
                                    {promo.code}
                                    <span className="ml-2 font-sans text-xs font-semibold text-amber-800">
                                      {promo.discountType === "PERCENT"
                                        ? `Giảm ${promo.discountValue}%`
                                        : `Giảm ${Number(promo.discountValue).toLocaleString("vi-VN")}đ`}
                                    </span>
                                  </p>
                                  <p className="truncate text-xs text-stone-600">
                                    {promo.name}
                                  </p>
                                  {Number(promo.minOrderAmount) > 0 && (
                                    <p className="text-[11px] text-stone-500">
                                      {meetsMinimum
                                        ? `Đơn tối thiểu ${formatCurrency(promo.minOrderAmount)}`
                                        : `Mua thêm ${formatCurrency(amountNeeded)} để dùng mã`}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(event) => handleApplyPromo(event, promo.code)}
                                  disabled={promoLoading || !meetsMinimum}
                                  className="shrink-0 rounded-md border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {meetsMinimum ? "Áp dụng" : "Chưa đủ"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-900 text-sm">
                            {appliedPromotion.code}
                          </span>
                          <span className="text-[11px] font-bold bg-emerald-200/80 text-emerald-800 px-1.5 py-0.5 rounded">
                            {appliedPromotion.discountType === "PERCENT"
                              ? `Giảm ${appliedPromotion.discountValue}%`
                              : `Giảm ${Number(appliedPromotion.discountValue).toLocaleString("vi-VN")}đ`}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          {appliedPromotion.name}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      title="Gỡ mã khuyến mãi"
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tổng & Giảm giá */}
              <div className="space-y-3 border-t border-stone-200 pt-4 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {appliedPromotion && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" />
                      Giảm giá voucher
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

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
                className="w-full rounded-lg bg-amber-800 px-5 py-3.5 font-bold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50 transition shadow-md shadow-amber-800/20"
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
