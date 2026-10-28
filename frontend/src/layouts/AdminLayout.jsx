import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Coffee,
  FolderTree,
  ShoppingBag,
  Armchair,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { logout } from "../services/authApi";

export default function AdminLayout({ children, title = "Quản Trị Hệ Thống" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    {
      to: "/admin",
      label: "Tổng Quan",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: "/admin/products",
      label: "Sản Phẩm",
      icon: Coffee,
    },
    {
      to: "/admin/categories",
      label: "Danh Mục",
      icon: FolderTree,
    },
    {
      to: "/admin/orders",
      label: "Đơn Hàng",
      icon: ShoppingBag,
    },
    {
      to: "/admin/tables",
      label: "Bàn Cà Phê",
      icon: Armchair,
    },
    {
      to: "/admin/users",
      label: "Người Dùng",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-800 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-stone-900 text-stone-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-stone-800 bg-stone-950/40">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/30">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-amber-100 tracking-wide block leading-tight">
                Bickrost
              </span>
              <span className="text-[10px] uppercase font-semibold text-amber-400/80 tracking-widest">
                Coffee Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Menu Quản Lý
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/20"
                    : "text-stone-300 hover:bg-stone-800/80 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-stone-400"}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Truy Cập Nhanh
          </div>
          <Link
            to="/shop"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-stone-300 hover:bg-stone-800 hover:text-amber-300 transition-colors"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-stone-400" />
              Xem Cửa Hàng
            </span>
            <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded">
              Shop
            </span>
          </Link>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-700/80 text-amber-200 flex items-center justify-center font-bold text-xs ring-2 ring-amber-600/40">
                AD
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">Quản Trị Viên</p>
                <p className="text-[10px] text-amber-400/90 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 inline" /> Admin Role
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <span className="font-medium text-stone-800">Admin</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
              <span className="font-semibold text-amber-800">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-amber-800 bg-stone-100 hover:bg-stone-200/70 px-3 py-1.5 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Giao diện Khách hàng
            </Link>

            <div className="relative">
              <button
                type="button"
                className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg relative"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-600 rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
