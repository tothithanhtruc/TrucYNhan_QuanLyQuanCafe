import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUserRole, login } from "../../services/authApi";
import { Coffee, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const defaultDestination = role === "ADMIN" ? "/admin" : "/shop";
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

          {/* Form */}
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
                <Link
                  to="#"
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold"
                >
                  Quên mật khẩu?
                </Link>
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
        </div>
      </div>
    </main>
  );
}
