
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/format";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Check,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Store,
  ReceiptText,
  Wallet,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
  UserRound,
  Landmark,
  BadgeCheck,
} from "lucide-react";
import {
  simulateVNPayPayment,
  createVNPayPaymentUrl,
} from "../../services/paymentApi";

const SUPPORTED_BANKS = [
  { code: "NCB", name: "NCB - Ngân hàng TMCP Quốc Dân", shortName: "NCB" },
  { code: "VCB", name: "Vietcombank - Ngân hàng Ngoại Thương", shortName: "VCB" },
  { code: "TCB", name: "Techcombank - Ngân hàng Kỹ Thương", shortName: "TCB" },
  { code: "MB", name: "MBBank - Ngân hàng Quân Đội", shortName: "MB" },
  { code: "BIDV", name: "BIDV - Ngân hàng Đầu tư & PT", shortName: "BIDV" },
  { code: "CTG", name: "VietinBank - Ngân hàng Công Thương", shortName: "CTG" },
  { code: "ACB", name: "ACB - Ngân hàng Á Châu", shortName: "ACB" },
  { code: "VPB", name: "VPBank - Ngân hàng VN Thịnh Vượng", shortName: "VPB" },
  { code: "TPB", name: "TPBank - Ngân hàng Tiên Phong", shortName: "TPB" },
  { code: "AGRIBANK", name: "Agribank - Ngân hàng Nông nghiệp", shortName: "AGR" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

export default function VNPayGatewayPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderCode = searchParams.get("orderCode") || "";
  const amount = Number(searchParams.get("amount") || 0);

  const [bankCode, setBankCode] = useState("NCB");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [otp, setOtp] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const selectedBank =
    SUPPORTED_BANKS.find((bank) => bank.code === bankCode) ||
    SUPPORTED_BANKS[0];

  const handleFillTestCard = () => {
    setBankCode("NCB");
    setCardNumber("9704198526191432198");
    setCardHolder("NGUYEN VAN A");
    setIssueDate("07/15");
    setOtp("123456");
    setError(null);
  };

  const handleClearCard = () => {
    setCardNumber("");
    setCardHolder("");
    setIssueDate("");
    setOtp("");
    setError(null);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();

    if (!orderCode) {
      setError("Không tìm thấy mã đơn hàng cần thanh toán!");
      return;
    }

    if (!bankCode) {
      setError("Vui lòng chọn ngân hàng thanh toán.");
      return;
    }

    if (!cardNumber.trim()) {
      setError("Vui lòng nhập số thẻ ATM ngân hàng.");
      return;
    }

    if (!cardHolder.trim()) {
      setError("Vui lòng nhập họ và tên chủ thẻ.");
      return;
    }

    if (!issueDate.trim()) {
      setError("Vui lòng nhập ngày phát hành thẻ (MM/YY).");
      return;
    }

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP xác thực.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await simulateVNPayPayment({
        orderCode,
        bankCode,
        cardNumber: cardNumber.trim(),
        cardHolder: cardHolder.trim(),
      });

      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        navigate(
          `/payment/vnpay-return?vnp_TxnRef=${encodeURIComponent(
            orderCode
          )}&vnp_ResponseCode=00&vnp_BankCode=${encodeURIComponent(bankCode)}`
        );
      }
    } catch (err) {
      console.error("Lỗi xác nhận thanh toán VNPAY:", err);
      setError(
        err.response?.data?.message ||
          "Không thể xử lý giao dịch. Vui lòng kiểm tra lại thông tin và thử lại."
      );
      setProcessing(false);
    }
  };

  const handleOpenRealVNPay = async () => {
    if (!orderCode) {
      setError("Không tìm thấy mã đơn hàng!");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const res = await createVNPayPaymentUrl({
        orderCode,
        bankCode: bankCode || "NCB",
      });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        setError("Không nhận được đường dẫn thanh toán từ cổng VNPAY.");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Lỗi mở cổng VNPay:", err);
      setError(
        err.response?.data?.message || "Không thể kết nối cổng ngoài VNPAY."
      );
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-200">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-blue-800">
                VNPAY<span className="text-red-500">QR</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Payment Gateway
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">
              Sandbox Environment
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <ShieldCheck size={17} className="text-emerald-600" />
            <span className="hidden sm:inline">Giao dịch bảo mật</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* TITLE */}
        <div className="mb-7">
          <button
            onClick={() => navigate("/cart")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <ArrowLeft size={17} />
            Quay lại giỏ hàng
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Thanh toán trực tuyến
                </span>
                <span className="text-xs text-slate-400">Bước 2/2</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Hoàn tất thanh toán
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Chọn ngân hàng và nhập thông tin để tiếp tục giao dịch.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Lock size={15} className="text-emerald-600" />
              Kết nối được bảo vệ
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* LEFT: ORDER SUMMARY */}
          <aside className="space-y-5 lg:col-span-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <ReceiptText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Chi tiết đơn hàng
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Thông tin giao dịch của bạn
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Store size={21} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Đơn vị thụ hưởng</p>
                    <p className="mt-1 text-sm font-extrabold text-slate-800">
                      TRÚC Ý NHÂN COFFEE
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Mã đơn hàng
                  </p>
                  <p className="break-all font-mono text-sm font-bold text-blue-700">
                    #{orderCode || "ORD-TEST"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Tổng thanh toán
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-red-600">
                    {formatCurrency(amount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Số tiền đã bao gồm các khoản phí (nếu có).
                  </p>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Nội dung giao dịch</span>
                    <span className="max-w-[60%] text-right font-semibold text-slate-700">
                      Thanh toan don hang {orderCode}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            
          </aside>

          {/* RIGHT: PAYMENT FORM */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-7">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Thông tin thanh toán
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Vui lòng điền đầy đủ thông tin bên dưới
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-6 p-5 sm:p-7">
              {/* BANK SELECT */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    01. Chọn ngân hàng
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {SUPPORTED_BANKS.length} ngân hàng
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {SUPPORTED_BANKS.slice(0, 5).map((bank) => (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => setBankCode(bank.code)}
                      className={`relative rounded-xl border px-2 py-3 text-center transition ${
                        bankCode === bank.code
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      {bankCode === bank.code && (
                        <CheckCircle2
                          size={14}
                          className="absolute right-1.5 top-1.5 text-blue-600"
                        />
                      )}
                      <Landmark size={19} className="mx-auto mb-1.5" />
                      <span className="text-xs font-extrabold">
                        {bank.shortName}
                      </span>
                    </button>
                  ))}
                </div>

                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className={inputClass}
                >
                  {SUPPORTED_BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-100" />

              {/* CARD NUMBER */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  02. Số thẻ ATM / Tài khoản
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Nhập số thẻ ATM"
                    className={`${inputClass} pl-11 font-mono`}
                  />
                </div>
              </div>

              {/* CARD HOLDER + ISSUE DATE */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    03. Tên chủ thẻ
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) =>
                        setCardHolder(e.target.value.toUpperCase())
                      }
                      placeholder="NGUYEN VAN A"
                      className={`${inputClass} pl-11 uppercase`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    04. Ngày phát hành
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      placeholder="MM/YY"
                      className={`${inputClass} pl-11 font-mono`}
                    />
                  </div>
                </div>
              </div>

              {/* OTP */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  05. Mã xác thực OTP
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP"
                  className={`${inputClass} text-center font-mono tracking-[0.4em]`}
                />
                <p className="mt-2 text-[11px] text-slate-400">
                  Nhập mã OTP kiểm thử được cung cấp trong môi trường Sandbox.
                </p>
              </div>

              {/* PAYMENT AMOUNT */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Số tiền thanh toán
                    </p>
                    <p className="mt-1 text-xl font-black text-blue-800">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Wallet size={22} />
                  </div>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    ĐANG XỬ LÝ GIAO DỊCH...
                  </>
                ) : (
                  <>
                    <Lock size={17} />
                    XÁC NHẬN THANH TOÁN
                  </>
                )}
              </button>

              <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 text-xs sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleClearCard}
                  className="inline-flex items-center justify-center gap-1.5 font-semibold text-slate-500 transition hover:text-red-600"
                >
                  <RotateCcw size={14} />
                  Xóa thông tin đã nhập
                </button>

                <button
                  type="button"
                  onClick={handleOpenRealVNPay}
                  disabled={processing}
                  className="inline-flex items-center justify-center gap-1.5 font-semibold text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
                >
                  Thanh toán qua cổng VNPay Sandbox
                  <ExternalLink size={14} />
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* BOTTOM TRUST */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            Bảo mật giao dịch
          </span>
          <span className="flex items-center gap-2">
            <Lock size={15} className="text-blue-600" />
            Môi trường Sandbox
          </span>
          <span className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-blue-600" />
            Trúc Ý Nhân Coffee
          </span>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-400">
        © 2026 Trúc Ý Nhân Coffee · Tích hợp VNPay Sandbox
      </footer>
    </div>
  );
}
