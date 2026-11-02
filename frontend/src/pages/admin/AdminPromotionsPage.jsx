import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Ticket,
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Calendar,
  Percent,
  Banknote,
  Clock,
  Layers,
} from "lucide-react";
import {
  adminGetPromotions,
  adminCreatePromotion,
  adminUpdatePromotion,
  adminDeletePromotion,
} from "../../services/adminApi";
import Pagination from "../../components/Pagination";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "Không giới hạn";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const toInputDateTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [viewingPromotion, setViewingPromotion] = useState(null);

  // Form State
  const initialFormState = {
    name: "",
    code: "",
    description: "",
    discountType: "PERCENT",
    discountValue: 10,
    minOrderAmount: 0,
    quantity: 100,
    startDate: "",
    endDate: "",
    status: 1,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await adminGetPromotions();
      setPromotions(response.data?.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách khuyến mãi:", err);
      showToast("Không thể tải danh sách khuyến mãi.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleOpenModal = (promo = null) => {
    setFormError("");
    if (promo) {
      setEditingPromotion(promo);
      setFormData({
        name: promo.name || "",
        code: promo.code || "",
        description: promo.description || "",
        discountType: promo.discountType || "PERCENT",
        discountValue: promo.discountValue ?? 0,
        minOrderAmount: promo.minOrderAmount ?? 0,
        quantity: promo.quantity ?? 0,
        startDate: toInputDateTime(promo.startDate),
        endDate: toInputDateTime(promo.endDate),
        status: promo.status ?? 1,
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        ...initialFormState,
        code: generateRandomCode(),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    setFormData(initialFormState);
    setFormError("");
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "COFFEE";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên khuyến mãi.");
      return;
    }
    if (!formData.code.trim()) {
      setFormError("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    if (formData.discountValue <= 0) {
      setFormError("Giá trị giảm giá phải lớn hơn 0.");
      return;
    }
    if (formData.discountType === "PERCENT" && formData.discountValue > 100) {
      setFormError("Giảm giá phần trăm không được vượt quá 100%.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || null,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount || 0),
        quantity: Number(formData.quantity || 0),
        startDate: formData.startDate ? formData.startDate + ":00" : null,
        endDate: formData.endDate ? formData.endDate + ":00" : null,
        status: Number(formData.status),
      };

      if (editingPromotion) {
        await adminUpdatePromotion(editingPromotion.id, payload);
        showToast("Cập nhật khuyến mãi thành công!");
      } else {
        await adminCreatePromotion(payload);
        showToast("Tạo mới khuyến mãi thành công!");
      }

      handleCloseModal();
      fetchPromotions();
    } catch (err) {
      console.error("Lỗi khi lưu khuyến mãi:", err);
      setFormError(
        err.response?.data?.message || "Có lỗi xảy ra khi lưu khuyến mãi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await adminDeletePromotion(deleteConfirmItem.id);
      showToast(`Đã chuyển mã "${deleteConfirmItem.code}" vào thùng rác.`);
      setDeleteConfirmItem(null);
      fetchPromotions();
    } catch (err) {
      console.error("Lỗi khi xóa khuyến mãi:", err);
      showToast("Không thể xóa khuyến mãi. Vui lòng thử lại.", "error");
    }
  };

  // Filter
  const filteredPromotions = promotions.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? p.status === 1
        : p.status === 0;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPromotions.length / pageSize) || 1;
  const paginatedPromotions = filteredPromotions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Statistics
  const totalCount = promotions.length;
  const activeCount = promotions.filter((p) => p.status === 1).length;
  const inactiveCount = promotions.filter((p) => p.status === 0).length;

  return (
    <AdminLayout title="Quản Lý Khuyến Mãi">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm animate-in fade-in slide-in-from-bottom-3 ${
            notification.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          {notification.type === "error" ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
              <Ticket className="w-7 h-7 text-amber-700" />
              Chương Trình Khuyến Mãi
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Quản lý danh sách mã giảm giá, voucher và ưu đãi checkout cho khách hàng.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/trash?tab=promotions"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition shadow-xs"
            >
              <Trash2 className="w-4 h-4 text-stone-500" />
              Thùng rác
            </Link>

            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-md shadow-amber-700/20 transition-all hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Thêm Khuyến Mãi
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">Tổng chương trình</p>
              <p className="text-2xl font-bold text-stone-900">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">Đang kích hoạt</p>
              <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
              <X className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">Tạm ẩn</p>
              <p className="text-2xl font-bold text-stone-700">{inactiveCount}</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-stone-700 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang kích hoạt</option>
              <option value="inactive">Tạm ẩn</option>
            </select>

            <button
              onClick={fetchPromotions}
              title="Tải lại danh sách"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-700" : ""}`} />
            </button>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã Khuyến Mãi</th>
                  <th className="py-3.5 px-4">Tên & Mô Tả</th>
                  <th className="py-3.5 px-4">Giảm Giá</th>
                  <th className="py-3.5 px-4">Đơn Tối Thiểu</th>
                  <th className="py-3.5 px-4">Lượt Còn</th>
                  <th className="py-3.5 px-4">Thời Hạn</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-700" />
                      Đang tải danh sách khuyến mãi...
                    </td>
                  </tr>
                ) : paginatedPromotions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      <Ticket className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                      Không tìm thấy chương trình khuyến mãi nào.
                    </td>
                  </tr>
                ) : (
                  paginatedPromotions.map((item) => {
                    const isExpired = item.endDate && new Date(item.endDate) < new Date();
                    const isUpcoming = item.startDate && new Date(item.startDate) > new Date();
                    const isOutOfStock = item.quantity !== null && item.quantity <= 0;

                    return (
                      <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold tracking-wider">
                            <Ticket className="w-3.5 h-3.5 text-amber-700" />
                            {item.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-stone-800">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.discountType === "PERCENT" ? (
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Percent className="w-3.5 h-3.5" />
                              {item.discountValue}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                              <Banknote className="w-3.5 h-3.5" />
                              {Number(item.discountValue).toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 text-xs font-medium">
                          {item.minOrderAmount > 0
                            ? `${Number(item.minOrderAmount).toLocaleString("vi-VN")}đ`
                            : "0đ (Mọi đơn)"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.quantity === null || item.quantity === undefined ? (
                            <span className="text-xs text-stone-500">Vô hạn</span>
                          ) : item.quantity <= 0 ? (
                            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              Hết lượt
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                              {item.quantity}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-stone-600">
                          {isExpired ? (
                            <span className="text-rose-600 font-medium">Đã hết hạn</span>
                          ) : isUpcoming ? (
                            <span className="text-blue-600 font-medium">Sắp diễn ra</span>
                          ) : (
                            <div>
                              <div>Đến: {formatDateTime(item.endDate)}</div>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.status === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Kích hoạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                              Tạm ẩn
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingPromotion(item)}
                              title="Xem chi tiết"
                              className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(item)}
                              title="Chỉnh sửa"
                              className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem(item)}
                              title="Xóa mềm (vào thùng rác)"
                              className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL THÊM / SỬA KHUYẾN MÃI ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {editingPromotion ? "Chỉnh Sửa Khuyến Mãi" : "Tạo Mới Khuyến Mãi"}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {editingPromotion
                      ? `Cập nhật thông tin mã ${editingPromotion.code}`
                      : "Điền thông tin chương trình khuyến mãi mới"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tên */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tên chương trình *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Chào hè sảng khoái 20%"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  />
                </div>

                {/* Mã khuyến mãi */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Mã voucher / Promo code *
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                      className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Tạo ngẫu nhiên
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="VD: HE2026, BANME20..."
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold tracking-wider text-amber-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>

                {/* Loại giảm giá */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Hình thức giảm giá *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="AMOUNT">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                {/* Mức giảm */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Mức giảm * {formData.discountType === "PERCENT" ? "(%)" : "(VNĐ)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.discountType === "PERCENT" ? 100 : 10000000}
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  />
                </div>

                {/* Đơn hàng tối thiểu */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Đơn tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: e.target.value })
                    }
                    placeholder="0 = Không yêu cầu"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  />
                </div>

                {/* Số lượng mã */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Số lượng lượt dùng
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="VD: 100"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  />
                </div>

                {/* Ngày bắt đầu */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Bắt đầu áp dụng
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  />
                </div>

                {/* Ngày kết thúc */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Hết hạn lúc
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  />
                </div>

                {/* Trạng thái */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Trạng thái kích hoạt
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 font-medium"
                  >
                    <option value={1}>Kích hoạt ngay (Người dùng có thể áp dụng)</option>
                    <option value={0}>Tạm ẩn / Vô hiệu hóa</option>
                  </select>
                </div>

                {/* Mô tả */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Mô tả / Điều kiện áp dụng
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Áp dụng cho mọi đơn thức uống tại quán hoặc giao hàng tận nơi..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-md shadow-amber-700/20 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingPromotion ? "Lưu Thay Đổi" : "Tạo Khuyến Mãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL XEM CHI TIẾT ─── */}
      {viewingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-bold text-stone-900">Chi Tiết Khuyến Mãi</h3>
              </div>
              <button
                onClick={() => setViewingPromotion(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-800">Mã khuyến mãi</p>
                  <p className="text-xl font-mono font-bold text-amber-950 mt-0.5">
                    {viewingPromotion.code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-amber-800">Mức ưu đãi</p>
                  <p className="text-xl font-bold text-amber-950 mt-0.5">
                    {viewingPromotion.discountType === "PERCENT"
                      ? `${viewingPromotion.discountValue}%`
                      : `${Number(viewingPromotion.discountValue).toLocaleString("vi-VN")}đ`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-medium block">Tên chương trình</span>
                  <span className="font-semibold text-stone-800 mt-1 block">
                    {viewingPromotion.name}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-medium block">Trạng thái</span>
                  <span className="font-semibold mt-1 block">
                    {viewingPromotion.status === 1 ? (
                      <span className="text-emerald-700">Đang kích hoạt</span>
                    ) : (
                      <span className="text-stone-500">Tạm ẩn</span>
                    )}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-medium block">Đơn tối thiểu</span>
                  <span className="font-semibold text-stone-800 mt-1 block">
                    {viewingPromotion.minOrderAmount > 0
                      ? `${Number(viewingPromotion.minOrderAmount).toLocaleString("vi-VN")}đ`
                      : "Không giới hạn"}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-medium block">Số lượng còn lại</span>
                  <span className="font-semibold text-stone-800 mt-1 block">
                    {viewingPromotion.quantity ?? "Không giới hạn"}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl col-span-2">
                  <span className="text-xs text-stone-500 font-medium block">Thời gian hiệu lực</span>
                  <span className="text-stone-700 text-xs mt-1 block">
                    Từ: <strong>{formatDateTime(viewingPromotion.startDate)}</strong>
                    <br />
                    Đến: <strong>{formatDateTime(viewingPromotion.endDate)}</strong>
                  </span>
                </div>

                {viewingPromotion.description && (
                  <div className="p-3 bg-stone-50 rounded-xl col-span-2">
                    <span className="text-xs text-stone-500 font-medium block">Mô tả chi tiết</span>
                    <p className="text-stone-700 text-xs mt-1 leading-relaxed">
                      {viewingPromotion.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingPromotion(null)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL XÁC NHẬN XÓA MỀM ─── */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 md:p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-stone-900">
                Chuyển vào thùng rác?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Bạn có chắc chắn muốn xóa mã khuyến mãi{" "}
                <strong className="text-stone-800 font-mono">
                  "{deleteConfirmItem.code}"
                </strong>
                ? Bạn có thể khôi phục lại từ Thùng rác bất cứ lúc nào.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition"
              >
                Xóa vào thùng rác
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
