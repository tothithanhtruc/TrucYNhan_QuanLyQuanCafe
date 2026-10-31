import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
} from "../../services/profileApi";
import { getMyOrders } from "../../services/orderApi";
import { getMyContactReplies } from "../../services/contactApi";
import { MessageSquare, RefreshCw } from "lucide-react";
import { isLoggedIn, logout } from "../../services/authApi";
import { formatCurrency } from "../../utils/format";
import {
  Camera,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

const STATUS_MAP = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  PREPARING: { label: "Đang chuẩn bị", color: "bg-indigo-100 text-indigo-800" },
  SHIPPING: { label: "Đang giao", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Đã giao", color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-rose-100 text-rose-800" },
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("vi-VN");
};

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [userContacts, setUserContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState(null);

  /* Editable fields */
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    gender: "",
    image: "",
  });

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "orders"

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", {
        state: { from: "/profile", message: "Vui lòng đăng nhập để xem hồ sơ." },
        replace: true,
      });
      return;
    }
    fetchProfile();
    fetchOrders();
    fetchUserContacts();
  }, [navigate]);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getMyProfile();
      const data = res.data?.data || res.data;
      setProfile(data);
      setEditForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        gender: data.gender || "",
        image: data.image || "",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", {
          state: { from: "/profile", message: "Phiên đăng nhập đã hết hạn." },
          replace: true,
        });
        return;
      }
      setError("Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await getMyContactReplies();
      setUserContacts(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi khi tải phản hồi liên hệ:", err);
    } finally {
      setContactsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getMyOrders();
      const data = res.data?.data || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateMyProfile(editForm);
      const data = res.data?.data || res.data;
      setProfile(data);
      setEditForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        gender: data.gender || "",
        image: data.image || "",
      });
      setEditing(false);
      showToast("Cập nhật hồ sơ thành công!");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể cập nhật hồ sơ.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await uploadProfileImage(file);
      const image = response.data?.url;
      if (!image) throw new Error("Máy chủ không trả về đường dẫn ảnh.");
      setEditForm((form) => ({ ...form, image }));
      showToast("Đã tải ảnh lên. Hãy lưu hồ sơ để áp dụng ảnh mới.");
    } catch (uploadError) {
      showToast(
        uploadError.response?.data?.message ||
          uploadError.message ||
          "Không thể tải ảnh lên.",
        "error",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent" />
          <p className="mt-4 text-stone-500">Đang tải hồ sơ...</p>
        </main>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-rose-600">{error}</p>
        </main>
      </PublicLayout>
    );
  }

  const resolveAvatar = (img) => {
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `http://localhost:8081${img}`;
    return `http://localhost:8081/api/uploads/${img}`;
  };

  return (
    <PublicLayout>
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* ─── Header ─── */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-stone-900">Hồ sơ của tôi</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mb-8 flex border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === "profile"
                ? "border-amber-800 text-amber-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === "orders"
                ? "border-amber-800 text-amber-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <Package className="h-4 w-4" />
            Lịch sử mua hàng
            {orders.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* ─── Tab: Thông tin cá nhân ─── */}
        {activeTab === "profile" && profile && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative">
                {resolveAvatar(editing ? editForm.image : profile.image) ? (
                  <img
                    src={resolveAvatar(editing ? editForm.image : profile.image)}
                    alt={profile.fullName}
                    className="h-28 w-28 rounded-full border-4 border-amber-100 object-cover shadow"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-100 bg-amber-50 text-3xl font-bold text-amber-800 shadow">
                    {(profile.fullName || profile.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                {editing && (
                  <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-amber-800 text-white shadow hover:bg-amber-700" title="Tải ảnh đại diện">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>

              {/* Thông tin */}
              <div className="flex-1 text-center sm:text-left">
                {!editing ? (
                  <>
                    <h2 className="text-2xl font-bold text-stone-900">
                      {profile.fullName || profile.username}
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                      @{profile.username}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
                        <Mail className="h-5 w-5 text-amber-800" />
                        <div>
                          <p className="text-xs font-semibold uppercase text-stone-500">
                            Email
                          </p>
                          <p className="text-sm text-stone-800">
                            {profile.email || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
                        <Phone className="h-5 w-5 text-amber-800" />
                        <div>
                          <p className="text-xs font-semibold uppercase text-stone-500">
                            Số điện thoại
                          </p>
                          <p className="text-sm text-stone-800">
                            {profile.phone || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
                        <User className="h-5 w-5 text-amber-800" />
                        <div>
                          <p className="text-xs font-semibold uppercase text-stone-500">
                            Giới tính
                          </p>
                          <p className="text-sm text-stone-800">
                            {profile.gender || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
                        <MapPin className="h-5 w-5 text-amber-800" />
                        <div>
                          <p className="text-xs font-semibold uppercase text-stone-500">
                            Địa chỉ
                          </p>
                          <p className="text-sm text-stone-800">
                            {profile.address || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-900"
                    >
                      <Edit3 className="h-4 w-4" />
                      Chỉnh sửa hồ sơ
                    </button>
                  </>
                ) : (
                  /* ─── Editing form ─── */
                  <div className="w-full space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-stone-700">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, fullName: e.target.value }))
                        }
                        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-stone-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, email: e.target.value }))
                        }
                        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-stone-700">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-stone-700">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        maxLength={255}
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, address: e.target.value }))
                        }
                        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-stone-700">
                        Giới tính
                      </label>
                      <select
                        value={editForm.gender}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, gender: e.target.value }))
                        }
                        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-amber-800 focus:outline-none"
                      >
                        <option value="">Chưa cập nhật</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || uploadingImage}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-900 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setEditForm({
                            fullName: profile.fullName || "",
                            phone: profile.phone || "",
                            email: profile.email || "",
                            address: profile.address || "",
                            gender: profile.gender || "",
                            image: profile.image || "",
                          });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-5 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50"
                      >
                        <X className="h-4 w-4" />
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Lịch sử mua hàng ─── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white py-12 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-amber-800 border-t-transparent" />
                <p className="mt-3 text-sm text-stone-500">
                  Đang tải đơn hàng...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-stone-300" />
                <p className="mb-4 text-stone-500">
                  Bạn chưa có đơn hàng nào.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-900"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const status = STATUS_MAP[order.status] || {
                  label: order.status,
                  color: "bg-stone-100 text-stone-700",
                };
                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                      <div>
                        <p className="text-sm font-bold text-stone-900">
                          Đơn hàng #{order.orderCode}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatDate(order.orderDate || order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Danh sách sản phẩm */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-2.5 text-sm"
                          >
                            <div>
                              <span className="font-semibold text-stone-800">
                                {item.productName}
                              </span>
                              <span className="ml-2 text-stone-500">
                                × {item.quantity}
                              </span>
                            </div>
                            <span className="font-semibold text-stone-700">
                              {formatCurrency(item.subtotal || item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                      {order.deliveryAddress && (
                        <p className="flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {order.deliveryAddress}
                        </p>
                      )}
                      <p className="text-base font-bold text-amber-900">
                        Tổng: {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {/* ─── Tab: Phản hồi liên hệ ─── */}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Câu hỏi & Phản hồi từ Cửa hàng
                </h3>
                <p className="text-xs text-stone-500">
                  Xem lại phản hồi từ admin cho các liên hệ bạn đã gửi.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchUserContacts}
                disabled={contactsLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${contactsLoading ? "animate-spin" : ""}`} />
                Làm mới
              </button>
            </div>

            {contactsLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white py-12 text-center text-sm text-stone-500">
                Đang tải phản hồi...
              </div>
            ) : userContacts.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
                <Mail className="mx-auto h-10 w-10 text-stone-300" />
                <p className="mt-3 text-sm font-semibold text-stone-700">Chưa có liên hệ nào</p>
                <p className="mt-1 text-xs text-stone-500">
                  Bạn có thắc mắc hoặc cần hỗ trợ? Hãy gửi tin nhắn cho chúng tôi.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
                >
                  Gửi liên hệ ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userContacts.map((contact) => (
                  <article
                    key={contact.id}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-stone-50/80 px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">
                          {contact.subject || "Liên hệ"}
                        </span>
                        {contact.adminReply ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Đã phản hồi
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Đang chờ phản hồi
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500">
                        {formatDate(contact.createdAt)}
                      </span>
                    </div>

                    <div className="grid gap-3 p-5 text-sm">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Nội dung bạn gửi:
                        </span>
                        <p className="rounded-xl bg-stone-50 p-3 text-stone-700 text-sm">
                          {contact.message}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                          Phản hồi từ Admin:
                        </span>
                        {contact.adminReply ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-stone-800 text-sm leading-relaxed">
                            {contact.adminReply}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs italic text-stone-500">
                            Cửa hàng đang xử lý câu hỏi này. Bạn vui lòng kiểm tra lại sau nhé.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Toast ─── */}
        {notification && (
          <div
            className={`fixed right-5 top-5 z-[70] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              notification.type === "error"
                ? "border border-rose-200 bg-rose-50 text-rose-700"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
            role="status"
          >
            {notification.message}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
