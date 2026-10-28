import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Check,
  X,
  FileText,
} from "lucide-react";
import {
  adminGetOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} from "../../services/adminApi";
import { formatCurrency } from "../../utils/format";
import Pagination from "../../components/Pagination";



export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders();
      const data = res.data?.data || res.data || [];
      setOrders(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn hàng:", err);
      showToast("Không thể tải danh sách đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdateStatus = async (order, newStatus) => {
    setUpdatingId(order.id);
    try {
      const payload = {
        orderCode: order.orderCode,
        userId: order.userId,
        employeeId: order.employeeId,
        tableId: order.tableId,
        orderType: order.orderType,
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        deliveryAddress: order.deliveryAddress,
        status: newStatus,
        note: order.note,
      };

      await adminUpdateOrder(order.id, payload);
      showToast(`Đã chuyển trạng thái đơn #${order.orderCode || order.id} sang: ${newStatus}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đơn:", err);
      showToast("Cập nhật trạng thái thất bại", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteOrder(id);
      showToast("Xóa đơn hàng thành công!");
      setDeleteConfirmId(null);
      if (selectedOrder?.id === id) setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      showToast("Không thể xóa đơn hàng", "error");
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "COMPLETED" || s === "HOÀN THÀNH") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
        </span>
      );
    }
    if (s === "CONFIRMED" || s === "ĐÃ XÁC NHẬN" || s === "ĐANG XỬ LÝ") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <RefreshCw className="w-3.5 h-3.5" /> Đang chuẩn bị
        </span>
      );
    }
    if (s === "CANCELLED" || s === "ĐÃ HỦY") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" /> Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Chờ xác nhận
      </span>
    );
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      (o.orderCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.tableName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = (o.status || "PENDING").toUpperCase();
    const matchStatus =
      statusFilter === "all" || currentStatus === statusFilter.toUpperCase();

    return matchSearch && matchStatus;
  });
// Tính tổng số trang
const totalPages = Math.ceil(filteredOrders.length / pageSize);

// Lấy đơn hàng của trang hiện tại
const paginatedOrders = filteredOrders.slice(
  (page - 1) * pageSize,
  page * pageSize
);
  return (
    <AdminLayout title="Quản Lý Đơn Hàng">
      <div className="space-y-6">
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-semibold transition-all ${notification.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
          >
            {notification.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600" />
            )}
            {notification.message}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Danh Sách Đơn Hàng
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Theo dõi đơn phục vụ tại bàn, mang về và giao hàng online.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchOrders}
              title="Làm mới"
              className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              to="/admin/trash"
              title="Mở thùng rác"
              className="p-2.5 text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, khách hàng, bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "Tất cả" },
              { id: "PENDING", label: "Chờ xác nhận" },
              { id: "CONFIRMED", label: "Đang chuẩn bị" },
              { id: "COMPLETED", label: "Đã hoàn thành" },
              { id: "CANCELLED", label: "Đã hủy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${statusFilter === tab.id
                    ? "bg-amber-700 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-bold border-b border-stone-200/70">
                <tr>
                  <th className="py-3.5 px-4">Mã Đơn</th>
                  <th className="py-3.5 px-4">Khách Hàng / Bàn</th>
                  <th className="py-3.5 px-4">Hình Thức</th>
                  <th className="py-3.5 px-4">Tổng Tiền</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      Đang tải danh sách đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => (
                    <tr key={o.id || o.orderCode} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-bold text-amber-900">
                        #{o.orderCode || o.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-800">
                          {o.username || "Khách tại quầy"}
                        </div>
                        {o.tableName && (
                          <div className="text-xs text-amber-800 font-medium">
                            Phục vụ tại: Bàn {o.tableName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-stone-600">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {o.orderType || "Tại quán"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-500">
                        {o.orderDate || o.createdAt
                          ? new Date(o.orderDate || o.createdAt).toLocaleString("vi-VN")
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(o.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            title="Xem chi tiết & Cập nhật"
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(o.id)}
                            title="Xóa đơn hàng"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        {/* Modal Chi Tiết & Chuyển Trạng Thái Đơn Hàng */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Chi Tiết Đơn Hàng #{selectedOrder.orderCode || selectedOrder.id}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedOrder.orderDate || selectedOrder.createdAt
                      ? new Date(
                        selectedOrder.orderDate || selectedOrder.createdAt
                      ).toLocaleString("vi-VN")
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                  <div>
                    <span className="text-xs text-stone-500 block">Khách Hàng</span>
                    <span className="font-bold text-stone-800">
                      {selectedOrder.username || "Khách tại quầy"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">Bàn Phục Vụ</span>
                    <span className="font-bold text-stone-800">
                      {selectedOrder.tableName ? `Bàn ${selectedOrder.tableName}` : "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">Nhân Viên Phục Vụ</span>
                    <span className="font-semibold text-stone-700">
                      {selectedOrder.employeeName || "Chưa gán"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">Hình Thức Gọi Món</span>
                    <span className="font-semibold text-stone-700">
                      {selectedOrder.orderType || "Tại quán"}
                    </span>
                  </div>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600">
                    <span className="font-bold block text-stone-700 mb-0.5">Địa chỉ giao hàng:</span>
                    {selectedOrder.deliveryAddress}
                  </div>
                )}

                {selectedOrder.note && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Ghi chú từ khách:</span>
                    {selectedOrder.note}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-sm font-semibold text-stone-600">Tổng Tiền Thanh Toán:</span>
                  <span className="text-xl font-bold text-amber-900">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>

                {/* Quick Status Update Buttons */}
                <div className="pt-4 border-t border-stone-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2.5">
                    Cập Nhật Trạng Thái Đơn:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={updatingId === selectedOrder.id}
                      onClick={() => handleUpdateStatus(selectedOrder, "CONFIRMED")}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                    >
                      Đang Pha Chế
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === selectedOrder.id}
                      onClick={() => handleUpdateStatus(selectedOrder, "COMPLETED")}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                    >
                      Hoàn Thành
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === selectedOrder.id}
                      onClick={() => handleUpdateStatus(selectedOrder, "CANCELLED")}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                    >
                      Hủy Đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Xóa Đơn Hàng?</h3>
              <p className="text-xs text-stone-500 mt-2">
                Hành động này sẽ xóa dữ liệu đơn hàng khỏi hệ thống.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
                >
                  Xác Nhận Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
