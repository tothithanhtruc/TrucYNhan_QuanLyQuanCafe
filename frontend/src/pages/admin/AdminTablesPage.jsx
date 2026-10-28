import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Armchair,
  Plus,
  Users,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import {
  adminGetTables,
  adminCreateTable,
  adminUpdateTable,
  adminDeleteTable,
} from "../../services/adminApi";

export default function AdminTablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const initialFormState = {
    tableName: "",
    capacity: 4,
    area: "Tầng 1",
    status: "EMPTY",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await adminGetTables();
      const data = res.data?.data || res.data || [];
      setTables(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách bàn:", err);
      showToast("Không thể tải danh sách bàn", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingTable(null);
    setFormData(initialFormState);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setEditingTable(t);
    setFormData({
      tableName: t.tableName || "",
      capacity: t.capacity || 4,
      area: t.area || "Tầng 1",
      status: t.status || "EMPTY",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tableName.trim()) {
      setFormError("Vui lòng nhập tên/số hiệu bàn");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      tableName: formData.tableName.trim(),
      capacity: Number(formData.capacity) || 2,
      area: formData.area.trim() || "Tầng 1",
      status: formData.status,
    };

    try {
      if (editingTable) {
        await adminUpdateTable(editingTable.id, payload);
        showToast("Cập nhật thông tin bàn thành công!");
      } else {
        await adminCreateTable(payload);
        showToast("Thêm bàn mới thành công!");
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (err) {
      console.error("Lỗi khi lưu bàn:", err);
      setFormError(
        err.response?.data?.message || "Không thể lưu thông tin bàn. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (table, newStatus) => {
    try {
      const payload = {
        tableName: table.tableName,
        capacity: table.capacity,
        area: table.area,
        status: newStatus,
      };
      await adminUpdateTable(table.id, payload);
      showToast(`Đã chuyển ${table.tableName} sang: ${newStatus}`);
      fetchTables();
    } catch (err) {
      console.error("Lỗi đổi trạng thái bàn:", err);
      showToast("Không thể đổi trạng thái bàn", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteTable(id);
      showToast("Xóa bàn thành công!");
      setDeleteConfirmId(null);
      fetchTables();
    } catch (err) {
      console.error("Lỗi khi xóa bàn:", err);
      showToast("Không thể xóa bàn", "error");
    }
  };

  // Distinct areas
  const areas = Array.from(
    new Set(tables.map((t) => t.area).filter(Boolean))
  );

  // Filtered Tables
  const filteredTables = tables.filter((t) => {
    const matchArea = selectedArea === "all" || t.area === selectedArea;
    const matchStatus =
      selectedStatus === "all" ||
      (t.status || "EMPTY").toUpperCase() === selectedStatus.toUpperCase();
    return matchArea && matchStatus;
  });

  const emptyCount = tables.filter(
    (t) => (t.status || "EMPTY").toUpperCase() === "EMPTY" || (t.status || "").toUpperCase() === "TRỐNG"
  ).length;

  const occupiedCount = tables.filter(
    (t) => (t.status || "").toUpperCase() === "OCCUPIED" || (t.status || "").toUpperCase() === "CÓ KHÁCH"
  ).length;

  const reservedCount = tables.filter(
    (t) => (t.status || "").toUpperCase() === "RESERVED" || (t.status || "").toUpperCase() === "ĐÃ ĐẶT"
  ).length;

  return (
    <AdminLayout title="Quản Lý Bàn Cà Phê">
      <div className="space-y-6">
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-semibold transition-all ${
              notification.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {notification.type === "error" ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
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
              Sơ Đồ &amp; Quản Lý Bàn
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Theo dõi tình trạng bàn phục vụ, số chỗ ngồi và khu vực quán.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTables}
              title="Làm mới"
              className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Thêm Bàn Mới
            </button>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-medium">Tổng Số Bàn</span>
              <p className="text-2xl font-bold text-stone-900 mt-1">{tables.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-700 font-semibold">Bàn Đang Trống</span>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{emptyCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              ✓
            </div>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-700 font-semibold">Đang Có Khách</span>
              <p className="text-2xl font-bold text-rose-900 mt-1">{occupiedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 font-semibold">Đã Đặt Trước</span>
              <p className="text-2xl font-bold text-amber-900 mt-1">{reservedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              ★
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-stone-500 uppercase mr-1">Khu vực:</span>
            <button
              onClick={() => setSelectedArea("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedArea === "all"
                  ? "bg-amber-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
              }`}
            >
              Tất cả
            </button>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                  selectedArea === area
                    ? "bg-amber-700 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-stone-500 uppercase mr-1">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-3 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="EMPTY">Trống</option>
              <option value="OCCUPIED">Đang có khách</option>
              <option value="RESERVED">Đã đặt trước</option>
            </select>
          </div>
        </div>

        {/* Table Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-16 text-center text-stone-400">
              Đang tải danh sách bàn...
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="col-span-full py-16 text-center text-stone-400">
              Không tìm thấy bàn nào phù hợp
            </div>
          ) : (
            filteredTables.map((t) => {
              const status = (t.status || "EMPTY").toUpperCase();
              const isOccupied = status === "OCCUPIED" || status === "CÓ KHÁCH";
              const isReserved = status === "RESERVED" || status === "ĐÃ ĐẶT";
              const isEmpty = !isOccupied && !isReserved;

              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isOccupied
                      ? "bg-rose-50/60 border-rose-200"
                      : isReserved
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-white border-stone-200"
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isOccupied
                              ? "bg-rose-500 ring-4 ring-rose-200"
                              : isReserved
                              ? "bg-amber-500 ring-4 ring-amber-200"
                              : "bg-emerald-500 ring-4 ring-emerald-100"
                          }`}
                        />
                        <span className="font-bold text-base text-stone-900">
                          {t.tableName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          title="Sửa bàn"
                          className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
                          title="Xóa bàn"
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Area & Capacity */}
                    <div className="flex items-center gap-3 text-xs text-stone-500 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {t.area || "Tầng 1"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {t.capacity ? `${t.capacity} chỗ` : "4 chỗ"}
                      </span>
                    </div>
                  </div>

                  {/* 1-click Fast Status Bar */}
                  <div className="pt-3 border-t border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                      Chuyển nhanh trạng thái:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                      <button
                        onClick={() => handleQuickStatusChange(t, "EMPTY")}
                        className={`py-1.5 rounded-lg transition ${
                          isEmpty
                            ? "bg-emerald-600 text-white font-bold"
                            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        Trống
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(t, "OCCUPIED")}
                        className={`py-1.5 rounded-lg transition ${
                          isOccupied
                            ? "bg-rose-600 text-white font-bold"
                            : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                        }`}
                      >
                        Có khách
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(t, "RESERVED")}
                        className={`py-1.5 rounded-lg transition ${
                          isReserved
                            ? "bg-amber-600 text-white font-bold"
                            : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        Đã đặt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Thêm / Sửa Bàn */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-lg font-bold text-stone-900">
                  {editingTable ? "Cập Nhật Thông Tin Bàn" : "Thêm Bàn Cà Phê Mới"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Tên / Số Hiệu Bàn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bàn 01, Bàn Sân Vườn A1..."
                    value={formData.tableName}
                    onChange={(e) =>
                      setFormData({ ...formData, tableName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Khu Vực
                    </label>
                    <input
                      type="text"
                      placeholder="Tầng 1, Tầng 2, Ban công..."
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Số Chỗ Ngồi (Capacity)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Trạng Thái Ban Đầu
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  >
                    <option value="EMPTY">Trống (Sẵn sàng đón khách)</option>
                    <option value="OCCUPIED">Đang có khách</option>
                    <option value="RESERVED">Đã đặt trước</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : "Lưu Bàn"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Xóa Bàn Này?</h3>
              <p className="text-xs text-stone-500 mt-2">
                Bàn sẽ bị xóa khỏi sơ đồ quán. Bạn có chắc chắn muốn xóa?
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
