
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import SearchModal from "./SearchModal";
export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>
            </button>

            {/* Giỏ hàng */}
            <Link
              to="/cart"
              className="relative rounded-full bg-amber-50 p-2.5 text-amber-900 transition hover:bg-amber-100 sm:p-3"
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M5 8h14l1 12H4L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-800 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                0
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </button>

              {/* Menu tài khoản */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-stone-200 bg-white py-2 shadow-lg">
                  <Link
                    to="/admin"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50/70 border-b border-stone-100 transition hover:bg-amber-100"
                  >
                    Trang Quản Trị (Admin)
                  </Link>

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

                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
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
