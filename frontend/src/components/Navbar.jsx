
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  Mail,
} from "lucide-react";

import SearchModal from "./SearchModal";
import { isLoggedIn, logout } from "../services/authApi";
import {
  CART_UPDATED_EVENT,
  getCartItemCount,
} from "../services/cartApi";

export default function Navbar() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [authenticated, setAuthenticated] = useState(isLoggedIn);

  // Đồng bộ số lượng sản phẩm trong giỏ hàng
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };
    const updateAuthentication = () => setAuthenticated(isLoggedIn());

    // Cập nhật lần đầu
    updateCartCount();

    // Lắng nghe sự kiện thay đổi giỏ hàng
    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
    window.addEventListener("auth-changed", updateCartCount);
    window.addEventListener("auth-changed", updateAuthentication);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
      window.removeEventListener("auth-changed", updateCartCount);
      window.removeEventListener("auth-changed", updateAuthentication);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Home", end: true },
    { to: "/shop", label: "Shop" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-2xl font-bold italic tracking-wide text-stone-800 transition-colors hover:text-amber-800"
          >
            Bickrost
          </Link>

          {/* Menu điều hướng */}
          <ul className="hidden items-center gap-8 md:flex">
            {navItems.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `border-b-2 pb-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "border-amber-800 text-amber-800"
                        : "border-transparent text-stone-700 hover:text-amber-800"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Các nút chức năng */}
          <div className="flex items-center gap-3">

            {/* Tìm kiếm */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="rounded-full bg-amber-50 p-2.5 text-amber-900 transition hover:bg-amber-100 sm:p-3"
              aria-label="Tìm kiếm sản phẩm"
              title="Tìm kiếm"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Hộp thư */}
            <Link
              to="/inbox"
              onClick={() => setIsUserMenuOpen(false)}
              className="rounded-full bg-amber-50 p-2.5 text-amber-900 transition hover:bg-amber-100 sm:p-3"
              aria-label="Hộp thư phản hồi"
              title="Hộp thư phản hồi từ Admin"
            >
              <Mail className="h-4 w-4" />
            </Link>

            {/* Giỏ hàng */}
            <Link
              to="/cart"
              className="relative rounded-full bg-amber-50 p-2.5 text-amber-900 transition hover:bg-amber-100 sm:p-3"
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
            >
              <ShoppingBag className="h-5 w-5" />

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-800 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            </Link>

            {/* Tài khoản */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsUserMenuOpen((prev) => !prev)
                }
                className="rounded-full bg-amber-50 p-2.5 text-amber-900 transition hover:bg-amber-100 sm:p-3"
                aria-label="Tài khoản người dùng"
                aria-expanded={isUserMenuOpen}
                title="Tài khoản"
              >
                <UserRound className="h-5 w-5" />
              </button>

              {/* Menu tài khoản */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-stone-200 bg-white py-2 shadow-lg">

                  {authenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-amber-50 hover:text-amber-900"
                      >
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        to="/inbox"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 transition hover:bg-amber-50 hover:text-amber-900"
                      >
                        <Mail className="h-4 w-4 text-amber-800" />
                        Phản hồi liên hệ
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-amber-50 hover:text-amber-900"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-amber-50 hover:text-amber-900"
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hộp tìm kiếm */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
