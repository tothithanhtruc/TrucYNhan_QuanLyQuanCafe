import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";
import {
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
} from "../../services/adminApi";
import Pagination from "../../components/Pagination";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize =5;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Form State
  const initialFormState = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "STAFF",
    status: 1,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminGetUsers();
      const data = res.data?.data || res.data || [];
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      showToast("Không thể tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData(initialFormState);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "STAFF",
      status: user.status ?? 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;

    setDeleting(true);
    try {
      await adminDeleteUser(deleteConfirmUser.id);
      showToast("Xóa người dùng thành công!");
      setDeleteConfirmUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      showToast(
        err.response?.data?.message || "Không thể xóa người dùng",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setFormError("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!editingUser && !formData.password) {
      setFormError("Vui lòng nhập mật khẩu cho tài khoản mới");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      username: formData.username.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      status: Number(formData.status),
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingUser) {
        await adminUpdateUser(editingUser.id, payload);
        showToast("Cập nhật thông tin người dùng thành công!");
      } else {
        await adminCreateUser(payload);
        showToast("Thêm người dùng mới thành công!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi lưu người dùng:", err);
      setFormError(
        err.response?.data?.message || "Không thể lưu thông tin. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || "").includes(searchTerm);

    const userRole = (u.role || "CUSTOMER").toUpperCase() === "USER"
      ? "CUSTOMER"
      : (u.role || "CUSTOMER").toUpperCase();
    const matchRole = roleFilter === "all" || userRole === roleFilter.toUpperCase();

    return matchSearch && matchRole;
  });
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, Math.max(totalPages, 1)));
  }, [totalPages]);

  const getRoleBadge = (role) => {
    const r = (role || "CUSTOMER").toUpperCase();
    if (r === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Quản trị viên
        </span>
      );
    }
    if (r === "STAFF" || r === "EMPLOYEE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <UserCheck className="w-3.5 h-3.5" /> Nhân viên
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
        Khách hàng
      </span>
    );
  };

  return (
    <AdminLayout title="Quản Lý Người Dùng &amp; Nhân Viên">
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
              Tài Khoản Người Dùng &amp; Nhân Sự
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Phân quyền quản trị, tài khoản nhân viên pha chế, phục vụ và khách hàng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              title="Làm mới"
              className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Thêm Người Dùng
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-stone-500 uppercase mr-1">Vai trò:</span>
            {["all", "ADMIN", "STAFF", "CUSTOMER"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                  roleFilter === role
                    ? "bg-amber-700 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
                }`}
              >
                {role === "all"
                  ? "Tất cả"
                  : role === "ADMIN"
                  ? "Quản trị"
                  : role === "STAFF"
                  ? "Nhân viên"
                  : "Khách hàng"}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-bold border-b border-stone-200/70">
                <tr>
                  <th className="py-3.5 px-4">Người Dùng</th>
                  <th className="py-3.5 px-4">Liên Hệ</th>
                  <th className="py-3.5 px-4">Vai Trò</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm">
                            {(u.fullName || u.username || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{u.fullName || u.username}</p>
                            <p className="text-xs text-stone-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-stone-600 space-y-1">
                        {u.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            {u.email}
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            {u.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3 px-4">
                        {u.status === 0 ? (
                          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            Đã khóa
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Hoạt động
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setViewingUser(u)}
                            title="Xem chi tiết người dùng"
                            className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Sửa thông tin"
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            title="Xóa người dùng"
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

        {!loading && filteredUsers.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        {/* Modal Thêm / Sửa Người Dùng */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-lg font-bold text-stone-900">
                  {editingUser ? "Cập Nhật Tài Khoản" : "Tạo Tài Khoản Mới"}
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
                    Tên Đăng Nhập (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    placeholder="nguyenvan_a"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Họ Và Tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Số Điện Thoại
                    </label>
                    <input
                      type="text"
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    {editingUser ? "Mật Khẩu Mới (Để trống nếu giữ nguyên)" : "Mật Khẩu *"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Vai Trò
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    >
                      <option value="STAFF">Nhân viên (Staff)</option>
                      <option value="ADMIN">Quản trị viên (Admin)</option>
                      <option value="CUSTOMER">Khách hàng</option>
                    </select>
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
                      <option value={1}>Hoạt động</option>
                      <option value={0}>Khóa tài khoản</option>
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
                    {submitting ? "Đang lưu..." : "Lưu Tài Khoản"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewingUser && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Chi Tiết Người Dùng
                  </h3>
                  <p className="text-xs text-stone-500">Mã người dùng: {viewingUser.id}</p>
                </div>
                <button
                  onClick={() => setViewingUser(null)}
                  title="Đóng"
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-5 flex items-center gap-4">
                {viewingUser.image ? (
                  <img
                    src={viewingUser.image}
                    alt={viewingUser.fullName || viewingUser.username}
                    className="h-16 w-16 rounded-full border border-stone-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-900">
                    {(viewingUser.fullName || viewingUser.username || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-stone-900">
                    {viewingUser.fullName || viewingUser.username}
                  </h4>
                  <p className="text-sm text-stone-500">@{viewingUser.username}</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-stone-500">Email</dt>
                  <dd className="mt-1 break-words text-stone-700">{viewingUser.email || "Chưa cung cấp"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-stone-500">Số điện thoại</dt>
                  <dd className="mt-1 text-stone-700">{viewingUser.phone || "Chưa cung cấp"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-stone-500">Vai trò</dt>
                  <dd className="mt-1">{getRoleBadge(viewingUser.role)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-stone-500">Trạng thái</dt>
                  <dd className="mt-1 text-stone-700">
                    {viewingUser.status === 0 ? "Đã khóa" : "Hoạt động"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-stone-500">Giới tính</dt>
                  <dd className="mt-1 text-stone-700">{viewingUser.gender || "Chưa cập nhật"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-stone-500">Ngày tạo</dt>
                  <dd className="mt-1 text-stone-700">
                    {viewingUser.createdAt
                      ? new Date(viewingUser.createdAt).toLocaleString("vi-VN")
                      : "Không có thông tin"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-semibold uppercase text-stone-500">Địa chỉ</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-stone-700">
                    {viewingUser.address || "Chưa cung cấp"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Xóa người dùng?
              </h3>
              <p className="text-sm text-stone-500 mt-2">
                Tài khoản{" "}
                <span className="font-semibold text-stone-700">
                  {deleteConfirmUser.fullName || deleteConfirmUser.username}
                </span>{" "}
                sẽ được chuyển vào thùng rác.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {deleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
