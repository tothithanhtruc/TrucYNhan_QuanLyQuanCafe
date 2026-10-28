import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  DollarSign,
  ShoppingBag,
  Coffee,
  Armchair,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  adminGetProducts,
  adminGetOrders,
  adminGetTables,
  adminGetUsers,
} from "../../services/adminApi";
import { formatCurrency } from "../../utils/format";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    pendingOrdersCount: 0,
    totalRevenue: 0,
    tablesCount: 0,
    occupiedTablesCount: 0,
    usersCount: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [prodRes, orderRes, tableRes, userRes] = await Promise.allSettled([
        adminGetProducts(),
        adminGetOrders(),
        adminGetTables(),
        adminGetUsers(),
      ]);

      const products = getResponseData(prodRes);

      const orders = getResponseData(orderRes);

      const tablesData = getResponseData(tableRes);

      const users = getResponseData(userRes);

      const failedRequests = [
        prodRes,
        orderRes,
        tableRes,
        userRes,
      ].filter((result) => result.status === "rejected").length;
      if (failedRequests > 0) {
        setLoadError(`Không thể tải ${failedRequests} nguồn dữ liệu từ API.`);
      }

      const pendingOrders = orders.filter(
        (o) =>
          o.status?.toUpperCase() === "PENDING" ||
          o.status?.toUpperCase() === "CHỜ XỬ LÝ" ||
          !o.status
      );

      const completedOrders = orders.filter(
        (o) =>
          o.status?.toUpperCase() === "COMPLETED" ||
          o.status?.toUpperCase() === "DELIVERED"
      );

      const totalRev = completedOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount || 0),
        0
      );

      const occupied = tablesData.filter(
        (t) =>
          t.status?.toUpperCase() === "OCCUPIED" ||
          t.status?.toUpperCase() === "CÓ KHÁCH"
      ).length;

      setStats({
        productsCount: products.length,
        ordersCount: orders.length,
        pendingOrdersCount: pendingOrders.length,
        totalRevenue: totalRev,
        tablesCount: tablesData.length,
        occupiedTablesCount: occupied,
        usersCount: users.length,
      });

      setRecentOrders(sortNewestFirst(orders, ["orderDate", "createdAt"] ).slice(0, 5));
      setTables(tablesData.slice(0, 8));
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getResponseData = (result) => {
    if (result.status !== "fulfilled") return [];
    const data = result.value.data?.data || result.value.data || [];
    return Array.isArray(data) ? data : [];
  };

  const sortNewestFirst = (items, dateFields) =>
    [...items].sort((a, b) => {
      const getTime = (item) => {
        const date = dateFields.map((field) => item[field]).find(Boolean);
        return date ? new Date(date).getTime() : 0;
      };
      return getTime(b) - getTime(a) || Number(b.id || 0) - Number(a.id || 0);
    });

  const getOrderStatusBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "COMPLETED" || s === "HOÀN THÀNH") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Hoàn thành
        </span>
      );
    }
    if (s === "CANCELLED" || s === "ĐÃ HỦY") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3" /> Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3" /> Chờ xử lý
      </span>
    );
  };

  return (
    <AdminLayout title="Tổng Quan Hệ Thống">
      <div className="space-y-6">
      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{loadError}</span>
          <button
            onClick={fetchDashboardData}
            className="font-semibold underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Bảng Điều Khiển Quán Cà Phê
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Theo dõi doanh thu, tình trạng bàn và đơn hàng thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Thêm Sản Phẩm
            </Link>
            <Link
              to="/admin/tables"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Armchair className="w-4 h-4" /> Quản Lý Bàn
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Doanh Thu Đơn Hoàn Tất
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-stone-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> Doanh thu bán hàng
              </p>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Tổng Số Đơn Hàng
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-stone-900">
                {stats.ordersCount}
              </p>
              <p className="text-xs text-amber-700 mt-1 font-medium">
                {stats.pendingOrdersCount} đơn đang chờ xử lý
              </p>
            </div>
          </div>

          {/* Tables */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Bàn Cà Phê
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Armchair className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-stone-900">
                {stats.occupiedTablesCount} / {stats.tablesCount || 0}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                bàn đang có khách phục vụ
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Món / Sản Phẩm
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-stone-900">
                {stats.productsCount}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                trong menu quán cà phê
              </p>
            </div>
          </div>
        </div>

        {/* Tables & Recent Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-stone-800">Đơn Hàng Gần Đây</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Danh sách đơn hàng mới nhất cần xử lý
                </p>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-semibold border-b border-stone-100">
                  <tr>
                    <th className="py-3 px-4">Mã Đơn</th>
                    <th className="py-3 px-4">Khách Hàng / Bàn</th>
                    <th className="py-3 px-4">Loại Đơn</th>
                    <th className="py-3 px-4">Tổng Tiền</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400">
                        Chưa có đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id || order.orderCode} className="hover:bg-stone-50/70 transition">
                        <td className="py-3 px-4 font-semibold text-amber-900">
                          #{order.orderCode || order.id}
                        </td>
                        <td className="py-3 px-4 text-stone-700">
                          {order.tableName
                            ? `Bàn ${order.tableName}`
                            : order.username || "Khách vãng lai"}
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {order.orderType || "Tại quán"}
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {getOrderStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Table Monitor (1 col) */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-stone-800">Sơ Đồ Bàn Nhanh</h2>
                <p className="text-xs text-stone-500 mt-0.5">Trạng thái phục vụ tại quán</p>
              </div>
              <Link
                to="/admin/tables"
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                Chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
              {tables.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-stone-400 text-xs">
                  Chưa có dữ liệu bàn
                </div>
              ) : (
                tables.map((t) => {
                  const isOccupied =
                    t.status?.toUpperCase() === "OCCUPIED" ||
                    t.status?.toUpperCase() === "CÓ KHÁCH";
                  const isReserved =
                    t.status?.toUpperCase() === "RESERVED" ||
                    t.status?.toUpperCase() === "ĐÃ ĐẶT";

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isOccupied
                          ? "bg-rose-50/70 border-rose-200 text-rose-900"
                          : isReserved
                          ? "bg-amber-50/70 border-amber-200 text-amber-900"
                          : "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">
                          {t.tableName || `Bàn ${t.id}`}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isOccupied
                              ? "bg-rose-500"
                              : isReserved
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                      </div>
                      <div className="mt-2 text-[11px] font-medium flex items-center justify-between opacity-80">
                        <span>{t.area || "Tầng 1"}</span>
                        <span>{t.capacity ? `${t.capacity} chỗ` : ""}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Trống
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Có khách
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đã đặt
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
