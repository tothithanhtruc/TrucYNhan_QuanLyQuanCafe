import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Coffee, Lock, User } from "lucide-react";
import PublicLayout from "../../layouts/PublicLayout";
import { register } from "../../services/authApi";

const initialForm = {
  username: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        password: formData.password,
      });
      setRegistered(true);
      setFormData(initialForm);
    } catch (requestError) {
      console.error("Lỗi đăng ký tài khoản:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#faf8f5]">
        <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 mb-3 border border-amber-200/60 shadow-xs">
              <Coffee className="w-7 h-7" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 italic">
              Tạo Tài Khoản
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
              Đăng ký tài khoản khách hàng tại Bickrost Coffee
            </p>
          </div>

          {registered ? (
            <div className="text-center">
              <div
                className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold"
                role="status"
              >
                Đăng ký thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.
              </div>
              <Link
                to="/login"
                className="w-full py-3.5 px-4 bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold rounded-xl shadow-md transition inline-flex items-center justify-center gap-2"
              >
                Đến trang đăng nhập
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                  >
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                  >
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    minLength={3}
                    maxLength={50}
                    autoComplete="username"
                    placeholder="Ít nhất 3 ký tự"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                    >
                      Số điện thoại
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      maxLength={20}
                      autoComplete="tel"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Ít nhất 6 ký tự"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-900/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-500">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-bold text-amber-800 hover:text-amber-900"
                >
                  Đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
