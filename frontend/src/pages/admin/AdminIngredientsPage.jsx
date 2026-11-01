
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  Edit2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import Pagination from "../../components/Pagination";

import {
  adminCreateIngredient,
  adminDeleteIngredient,
  adminGetIngredients,
  adminUpdateIngredient,
} from "../../services/adminApi";

const initialForm = {
  name: "",
  unit: "",
  quantity: 0,
  minQuantity: 0,
  description: "",
  status: 1,
};

export default function AdminIngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Thông báo
  const notify = (message, type = "success") => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3500);
  };

  // Lấy danh sách nguyên liệu
  const loadIngredients = async () => {
    setLoading(true);

    try {
      const response = await adminGetIngredients();
      setIngredients(response.data?.data || []);
    } catch (err) {
      console.error("Lỗi khi tải nguyên liệu:", err);
      notify(
        err.response?.data?.message ||
          "Không thể tải danh sách nguyên liệu",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  // Khi tìm kiếm thì quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Lọc nguyên liệu theo tên
  const filtered = useMemo(
    () =>
      ingredients.filter((item) =>
        (item.name || "")
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      ),
    [ingredients, search]
  );

  // Tính tổng số trang
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Lấy nguyên liệu của trang hiện tại
  const visible = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Nếu xóa dữ liệu khiến trang hiện tại không còn hợp lệ
  useEffect(() => {
    setPage((currentPage) =>
      Math.min(currentPage, Math.max(totalPages, 1))
    );
  }, [totalPages]);

  // Mở modal thêm
  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  // Mở modal sửa
  const openEdit = (item) => {
    setEditing(item);

    setForm({
      name: item.name || "",
      unit: item.unit || "",
      quantity: item.quantity ?? 0,
      minQuantity: item.minQuantity ?? 0,
      description: item.description || "",
      status: item.status ?? 1,
    });

    setError("");
    setModalOpen(true);
  };

  // Thêm hoặc cập nhật nguyên liệu
  const submit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.unit.trim()) {
      setError("Vui lòng nhập tên nguyên liệu và đơn vị tính.");
      return;
    }

    if (
      Number(form.quantity) < 0 ||
      Number(form.minQuantity) < 0
    ) {
      setError("Số lượng không được âm.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      unit: form.unit.trim(),
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      description: form.description.trim(),
      status: Number(form.status),
    };

    setSubmitting(true);

    try {
      if (editing) {
        await adminUpdateIngredient(editing.id, payload);
        notify("Cập nhật nguyên liệu thành công!");
      } else {
        await adminCreateIngredient(payload);
        notify("Thêm nguyên liệu thành công!");
        setPage(1);
      }

      setModalOpen(false);
      await loadIngredients();
    } catch (err) {
      console.error("Lỗi khi lưu nguyên liệu:", err);

      setError(
        err.response?.data?.message ||
          "Không thể lưu nguyên liệu."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa nguyên liệu
  const remove = async (id) => {
    if (!window.confirm("Đưa nguyên liệu này vào thùng rác?")) {
      return;
    }

    setDeletingId(id);

    try {
      await adminDeleteIngredient(id);
      notify("Đã chuyển nguyên liệu vào thùng rác.");

      await loadIngredients();
    } catch (err) {
      console.error("Lỗi khi xóa nguyên liệu:", err);

      notify(
        err.response?.data?.message ||
          "Không thể xóa nguyên liệu",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="Quản Lý Nguyên Liệu">
      <div className="space-y-6">

        {/* Thông báo */}
        {notice && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold flex items-center gap-2 ${
              notice.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {notice.type === "error" ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}

            {notice.message}
          </div>
        )}

        {/* Tiêu đề và nút chức năng */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Nguyên Liệu
            </h1>

            <p className="text-sm text-stone-500 mt-1">
              Theo dõi tồn kho và ngưỡng cảnh báo nguyên liệu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadIngredients}
              title="Làm mới"
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-600"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>

            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Thêm nguyên liệu
            </button>

            <Link
              to="/admin/trash?tab=ingredients"
              title="Mở thùng rác"
              className="p-2.5 text-rose-600 bg-white border border-rose-200 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Tìm kiếm */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên nguyên liệu..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <p className="text-xs text-stone-500 mt-3">
            Tổng: {filtered.length} nguyên liệu
          </p>
        </div>

        {/* Bảng nguyên liệu */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3.5 px-4">Tên nguyên liệu</th>
                  <th className="py-3.5 px-4">Đơn vị</th>
                  <th className="py-3.5 px-4">Tồn kho</th>
                  <th className="py-3.5 px-4">Mức tối thiểu</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-stone-400"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-stone-400"
                    >
                      Chưa có nguyên liệu phù hợp.
                    </td>
                  </tr>
                ) : (
                  visible.map((item) => {
                    const low =
                      Number(item.quantity) <=
                      Number(item.minQuantity);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-50"
                      >
                        <td className="py-3 px-4 font-semibold text-stone-800">
                          <span className="inline-flex items-center gap-2">
                            <Package className="w-4 h-4 text-amber-700" />
                            {item.name}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {item.unit}
                        </td>

                        <td
                          className={`py-3 px-4 font-semibold ${
                            low
                              ? "text-rose-600"
                              : "text-stone-700"
                          }`}
                        >
                          {item.quantity}
                        </td>

                        <td className="py-3 px-4">
                          {item.minQuantity ?? 0}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              low
                                ? "bg-rose-50 text-rose-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {low ? "Sắp hết" : "Đủ dùng"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openEdit(item)}
                            title="Sửa nguyên liệu"
                            className="p-1.5 mr-1 text-stone-500 hover:text-amber-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => remove(item.id)}
                            disabled={deletingId === item.id}
                            title="Xóa nguyên liệu"
                            className="p-1.5 text-stone-500 hover:text-rose-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phân trang */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-stone-500">
              Hiển thị {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, filtered.length)} trong tổng số{" "}
              {filtered.length} nguyên liệu
            </p>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Modal thêm / sửa */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">

              <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                <h3 className="text-lg font-bold">
                  {editing
                    ? "Cập nhật nguyên liệu"
                    : "Thêm nguyên liệu"}
                </h3>

                <button
                  onClick={() => setModalOpen(false)}
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <form
                onSubmit={submit}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="text-xs font-bold uppercase">
                    Tên nguyên liệu *
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase">
                      Đơn vị *
                    </label>

                    <input
                      required
                      value={form.unit}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          unit: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase">
                      Trạng thái
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    >
                      <option value="1">Đang dùng</option>
                      <option value="0">Tạm ngưng</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase">
                      Số lượng *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase">
                      Mức tối thiểu
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={form.minQuantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minQuantity: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase">
                    Mô tả
                  </label>

                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-amber-700 text-white font-semibold disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
