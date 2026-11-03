import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getCurrentUserRole,
  login,
} from "../../services/authApi";
import {
  Coffee,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Smartphone,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(username.trim(), password);
      const role = getCurrentUserRole();
      const defaultDestination = role === "ADMIN" ? "/admin" : "/";
      navigate(location.state?.from || defaultDestination, {
        replace: true,
        state: location.state?.pendingCartAction
          ? { pendingCartAction: location.state.pendingCartAction }
          : null,
      });
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      const msg =
        err.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueReset = (e) => {
    e.preventDefault();
    if (!forgotUsername.trim() || !forgotPhone.trim()) {
      setError("Vui lòng nhập tên đăng nhập và số điện thoại đã đăng ký.");
      return;
    }

    setError("");
    setForgotMessage("");
    setForgotStep("password");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    setForgotMode(false);
    setPassword("");
    setForgotMessage(
      "Mô phỏng hoàn tất cho tài khoản này. Mật khẩu thật chưa được thay đổi.",
    );
  };

  const openForgotPassword = () => {
    setForgotUsername(username.trim());
    setForgotPhone("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotMessage("");
    setError("");
    setForgotStep("request");
    setForgotMode(true);
  };

  const closeForgotPassword = () => {
    setForgotMode(false);
    setError("");
    setForgotMessage("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-100">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url('/images/banner1.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/35" aria-hidden="true" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/95 p-8 shadow-2xl sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 mb-3 border border-amber-200/60 shadow-xs">
              <Coffee className="w-7 h-7" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 italic">
              Đăng Nhập Bickrost
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
              Hệ thống bán hàng &amp; quản lý quán cà phê
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {forgotMessage && (
            <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
              {forgotMessage}
            </p>
          )}

          {forgotMode ? (
            <section>
              <h2 className="mb-1 text-lg font-bold text-stone-900">
                {forgotStep === "request" ? "Quên mật khẩu" : "Đặt mật khẩu mới"}
              </h2>
             
              {forgotStep === "request" ? (
                <form onSubmit={handleContinueReset} className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Tên đăng nhập
                    </span>
                    <span className="relative block">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                        placeholder="Nhập tên tài khoản"
                      />
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Số điện thoại đã đăng ký
                    </span>
                    <span className="relative block">
                      <Smartphone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                        placeholder="0901234567"
                      />
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-amber-900"
                  >
                    Tiếp tục
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Mật khẩu mới
                    </span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Nhập lại mật khẩu mới
                    </span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                      placeholder="Nhập lại mật khẩu"
                    />
                  </label>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-amber-900"
                  >
                    Xác nhận
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={closeForgotPassword}
                className="mt-4 w-full text-sm font-semibold text-stone-500 hover:text-stone-800"
              >
                Quay lại đăng nhập
              </button>
            </section>
          ) : (
          /* Login form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Tên Đăng Nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Nhập tên tài khoản..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Mật Khẩu
                </label>
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-900/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          )}

          {location.state?.message && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900" role="status">
              {location.state.message}
            </p>
          )}
          <p className="mt-6 text-center text-sm text-stone-500">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              state={location.state}
              className="font-bold text-amber-800 hover:text-amber-900"
            >
              Đăng ký
            </Link>
          </p>
          <Link
            to="/"
            state={location.state}
            className="font-bold text-amber-800 hover:text-amber-900"
          >
            Quay lại
          </Link>
        </div>
      </div>
    </main>
  );
}
