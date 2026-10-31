
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { verifyVNPayCallback } from "../../services/paymentApi";
import { formatCurrency } from "../../utils/format";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  Clock3,
  Hash,
  Store,
} from "lucide-react";

export default function VNPayReturnPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    if (Object.keys(params).length === 0) {
      setLoading(false);
      setResult({
        success: false,
        message: "Không tìm thấy thông tin phản hồi từ cổng thanh toán VNPAY.",
      });
      return;
    }

    verifyVNPayCallback(params)
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        console.error("Lỗi xác thực thanh toán VNPAY:", err);
        setResult({
          success: false,
          message:
            err.response?.data?.message ||
            "Không thể xác thực giao dịch với máy chủ. Vui lòng kiểm tra lại đơn hàng trong hồ sơ.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const formatVnpDate = (str) => {
    if (!str || str.length < 14) return str || "-";

    const y = str.substring(0, 4);
    const m = str.substring(4, 6);
    const d = str.substring(6, 8);
    const h = str.substring(8, 10);
    const min = str.substring(10, 12);
    const s = str.substring(12, 14);

    return `${h}:${min}:${s} ${d}/${m}/${y}`;
  };

  const isSuccess = result?.success;

  return (
    <PublicLayout>
      <main className="relative min-h-[75vh] overflow-hidden bg-[#faf8f5] px-4 py-12 sm:py-16">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#e9dfd2]/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#e8e0d5]/60 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">

          {/* Logo / Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4b3023] text-white shadow-lg shadow-[#4b3023]/20">
              <Store className="h-7 w-7" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9a765d]">
              Thanh toán trực tuyến
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#38251c] sm:text-3xl">
              Kết quả thanh toán
            </h1>

            <p className="mt-2 text-sm text-[#8b796d]">
              Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng.
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-[28px] border border-[#eee5dc] bg-white p-10 text-center shadow-[0_15px_50px_rgba(75,48,35,0.08)] sm:p-14">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f5eee7]">
                <RefreshCw className="h-9 w-9 animate-spin text-[#80583e]" />
              </div>

              <h2 className="mt-6 text-xl font-bold text-[#38251c]">
                Đang xác thực giao dịch
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#928176]">
                Hệ thống đang kiểm tra chữ ký bảo mật từ VNPAY và cập nhật
                trạng thái đơn hàng của bạn. Vui lòng chờ trong giây lát.
              </p>

              <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-[#f0e9e2]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[#80583e]" />
              </div>
            </div>
          ) : isSuccess ? (
            /* SUCCESS */
            <section className="overflow-hidden rounded-[28px] border border-[#e8e1d7] bg-white shadow-[0_20px_60px_rgba(75,48,35,0.10)]">

              {/* Success header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#315b43] to-[#244735] px-6 py-10 text-center text-white sm:py-12">
                <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
                <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full border border-white/10" />

                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-inner">
                  <CheckCircle2 className="h-11 w-11 text-white" />
                </div>

                <div className="relative mt-5">
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100">
                    Giao dịch hoàn tất
                  </span>

                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Thanh toán thành công!
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-100">
                    Đơn hàng của bạn đã được thanh toán qua VNPAY Sandbox.
                    Cửa hàng sẽ sớm chuẩn bị đơn hàng.
                  </p>
                </div>
              </div>

              {/* Receipt */}
              <div className="p-5 sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-[#80583e]" />
                    <h3 className="font-bold text-[#38251c]">
                      Chi tiết giao dịch
                    </h3>
                  </div>

                  <span className="rounded-full bg-[#f4eee7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#80583e]">
                    VNPAY
                  </span>
                </div>

                {/* Amount */}
                <div className="rounded-2xl bg-[#f8f5f1] p-5 text-center">
                  <p className="text-xs font-medium text-[#9a887b]">
                    Tổng tiền đã thanh toán
                  </p>

                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#315b43] sm:text-4xl">
                    {formatCurrency(Number(result.amount || 0))}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã thanh toán
                  </div>
                </div>

                {/* Information */}
                <div className="mt-5 divide-y divide-dashed divide-[#eee7df] rounded-2xl border border-[#eee7df] px-4 sm:px-5">
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#958477]">
                      <Hash className="h-4 w-4" />
                      Mã đơn hàng
                    </div>
                    <span className="break-all text-right text-sm font-bold text-[#38251c]">
                      #{result.orderCode || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#958477]">
                      <CreditCard className="h-4 w-4" />
                      Ngân hàng
                    </div>
                    <span className="text-right text-sm font-semibold text-[#38251c]">
                      {result.bankCode || "NCB"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#958477]">
                      <ReceiptText className="h-4 w-4" />
                      Mã giao dịch
                    </div>
                    <span className="max-w-[55%] break-all text-right font-mono text-xs font-semibold text-[#5e4a3e]">
                      {result.transactionId || result.transactionNo || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#958477]">
                      <Clock3 className="h-4 w-4" />
                      Thời gian
                    </div>
                    <span className="text-right text-sm font-medium text-[#5e4a3e]">
                      {formatVnpDate(result.payDate)}
                    </span>
                  </div>
                </div>

                {/* Security note */}
                <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f4f7f3] p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#315b43]" />
                  <p className="text-xs leading-5 text-[#607565]">
                    Giao dịch đã được hệ thống xác minh chữ ký bảo mật và
                    cập nhật trạng thái đơn hàng.
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4b3023] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#4b3023]/15 transition hover:-translate-y-0.5 hover:bg-[#38251c] hover:shadow-xl"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Xem đơn hàng
                  </Link>

                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8ded3] bg-white px-5 py-3.5 text-sm font-bold text-[#5e493b] transition hover:border-[#b99a7e] hover:bg-[#faf7f3]"
                  >
                    Tiếp tục mua hàng
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            /* FAILURE */
            <section className="overflow-hidden rounded-[28px] border border-[#eee1dc] bg-white shadow-[0_20px_60px_rgba(75,48,35,0.10)]">

              <div className="bg-gradient-to-br from-[#9b4037] to-[#7c302a] px-6 py-10 text-center text-white sm:py-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15">
                  <XCircle className="h-11 w-11" />
                </div>

                <span className="mt-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-100">
                  Giao dịch chưa hoàn tất
                </span>

                <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                  Thanh toán thất bại
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-100">
                  {result?.message ||
                    "Giao dịch qua VNPAY đã bị hủy hoặc gặp sự cố."}
                </p>
              </div>

              <div className="p-5 sm:p-8">
                {result?.orderCode && (
                  <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#eee7df] bg-[#faf8f5] p-4">
                    <span className="text-sm text-[#958477]">
                      Mã đơn hàng
                    </span>
                    <strong className="text-sm text-[#38251c]">
                      #{result.orderCode}
                    </strong>
                  </div>
                )}

                {/* Sandbox test information */}
                <div className="rounded-2xl border border-[#eadcc9] bg-[#faf6ef] p-5">
                  <div className="mb-3 flex items-center gap-2 text-[#765333]">
                    <CreditCard className="h-5 w-5" />
                    <h3 className="text-sm font-bold">
                      Thông tin thẻ thử nghiệm Sandbox
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs text-[#806c59]">
                    <p>Ngân hàng: <strong>NCB</strong></p>
                    <p>Số thẻ: <strong>9704198526191432198</strong></p>
                    <p>Chủ thẻ: <strong>NGUYEN VAN A</strong></p>
                    <p>Ngày phát hành: <strong>07/15</strong></p>
                    <p>OTP: <strong>123456</strong></p>
                  </div>

                  <p className="mt-3 border-t border-[#eadcc9] pt-3 text-[11px] leading-5 text-[#9a846d]">
                    Đây là thông tin thẻ kiểm thử dành cho môi trường Sandbox,
                    không phải thông tin thẻ ngân hàng thật.
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    to="/cart"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4b3023] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#4b3023]/15 transition hover:-translate-y-0.5 hover:bg-[#38251c]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Thử thanh toán lại
                  </Link>

                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8ded3] bg-white px-5 py-3.5 text-sm font-bold text-[#5e493b] transition hover:bg-[#faf7f3]"
                  >
                    Kiểm tra đơn hàng
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          <p className="mt-7 text-center text-xs text-[#a5968a]">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
            Thanh toán được xử lý qua cổng VNPAY Sandbox
          </p>
        </div>
      </main>
    </PublicLayout>
  );
}
