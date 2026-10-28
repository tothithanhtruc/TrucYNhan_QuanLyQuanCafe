import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../../services/adminApi";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const initialFormState = {
    name: "",
    alias: "",
    description: "",
    image: "",
    sortOrder: 1,
    status: 1,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminGetCategories();
      const data = res.data?.data || res.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
      showToast("Không thể tải danh sách danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData(initialFormState);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      alias: cat.alias || "",
      description: cat.description || "",
      image: cat.image || "",
      sortOrder: cat.sortOrder ?? 1,
      status: cat.status ?? 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên danh mục");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      name: formData.name.trim(),
      alias: formData.alias.trim() || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description.trim(),
      image: formData.image.trim(),
      sortOrder: Number(formData.sortOrder) || 1,
      status: Number(formData.status),
    };

    try {
      if (editingCategory) {
        await adminUpdateCategory(editingCategory.id, payload);
        showToast("Cập nhật danh mục thành công!");
      } else {
        await adminCreateCategory(payload);
        showToast("Thêm danh mục mới thành công!");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err);
      setFormError(
        err.response?.data?.message || "Không thể lưu danh mục. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteCategory(id);
      showToast("Xóa danh mục thành công!");
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err);
      showToast("Không thể xóa danh mục", "error");
    }
  };

  const filteredCategories = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Quản Lý Danh Mục">
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
              Danh Mục Sản Phẩm
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Phân loại đồ uống, hạt cà phê, trà và bánh ngọt.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCategories}
              title="Làm mới"
              className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Thêm Danh Mục
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
            />
          </div>
          <span className="text-xs font-semibold text-stone-500 hidden sm:inline">
            Tổng: {filteredCategories.length} danh mục
          </span>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-bold border-b border-stone-200/70">
                <tr>
                  <th className="py-3.5 px-4">Tên Danh Mục</th>
                  <th className="py-3.5 px-4">Đường Dẫn (Alias)</th>
                  <th className="py-3.5 px-4">Mô Tả</th>
                  <th className="py-3.5 px-4 text-center">Thứ Tự</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      Đang tải danh mục...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {c.name}
                      </td>
                      <td className="py-3 px-4 text-stone-500 font-mono text-xs">
                        {c.alias || "-"}
                      </td>
                      <td className="py-3 px-4 text-stone-600 max-w-sm truncate text-xs">
                        {c.description || "Chưa có mô tả"}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-stone-700 text-xs">
                        {c.sortOrder ?? 1}
                      </td>
                      <td className="py-3 px-4">
                        {c.status === 0 ? (
                          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                            Ẩn
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Hiển thị
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            title="Sửa danh mục"
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(c.id)}
                            title="Xóa danh mục"
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

        {/* Modal Thêm / Sửa Danh Mục */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-lg font-bold text-stone-900">
                  {editingCategory ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
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
                    Tên Danh Mục *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cà Phê Pha Máy, Trà Trái Cây..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Đường Dẫn Rút Gọn (Alias / Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="ca-phe-pha-may (Tùy chọn)"
                    value={formData.alias}
                    onChange={(e) =>
                      setFormData({ ...formData, alias: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Mô Tả
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả về nhóm sản phẩm này..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Thứ Tự Hiển Thị
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Trạng Thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    >
                      <option value={1}>Hiển thị</option>
                      <option value={0}>Tạm ẩn</option>
                    </select>
                  </div>
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
                    {submitting ? "Đang lưu..." : "Lưu Danh Mục"}
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
              <h3 className="text-lg font-bold text-stone-900">Xóa Danh Mục?</h3>
              <p className="text-xs text-stone-500 mt-2">
                Các sản phẩm trong danh mục này có thể cần được phân loại lại. Bạn chắc chắn chứ?
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
