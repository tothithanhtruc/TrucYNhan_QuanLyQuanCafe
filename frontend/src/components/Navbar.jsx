import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="font-heading italic text-2xl font-bold text-stone-800 tracking-wide">
          Bickrost
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {[
            { to: "/", label: "Trang chủ", end: true },
            { to: "/products", label: "Sản phẩm" },
          ].map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `text-sm font-bold tracking-wide transition-colors ${isActive ? "text-amber-800 border-b-2 border-amber-800 pb-0.5" : "text-stone-700 hover:text-amber-800"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          {[ "Giới thiệu", "Bài viết", "Liên hệ"].map((item) => (
            <li key={item}>
              <a href="#" className="text-sm font-bold tracking-wide text-stone-700 hover:text-amber-800 transition-colors">
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Tìm kiếm */}
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-4xl leading-none text-stone-600 hover:text-amber-800 transition-colors"
          >
            ⌕
          </button>

          {/* Yêu thích */}
          <button
            type="button"
            className="relative w-10 h-10 flex items-center justify-center text-2xl leading-none text-stone-600 hover:text-amber-800 transition-colors"
          >
            🤍
            <span className="absolute top-0 right-0 bg-amber-800 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </button>

          {/* Giỏ hàng */}
          <button
            type="button"
            className="relative w-10 h-10 flex items-center justify-center text-2xl leading-none text-stone-600 hover:text-amber-800 transition-colors"
          >
            🛒
            <span className="absolute top-0 right-0 bg-amber-800 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </button>
        </div>

      </div>
    </nav>
  );
}
