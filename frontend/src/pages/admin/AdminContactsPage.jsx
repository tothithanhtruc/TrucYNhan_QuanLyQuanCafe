import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  deleteContact,
  forceDeleteContact,
  getContactById,
  getContacts,
  getTrashContacts,
  replyToContact,
  restoreContact,
} from "../../services/contactApi";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingTrash, setViewingTrash] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySaving, setReplySaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteMode, setDeleteMode] = useState("soft");
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const getRequestError = (error) => {
    const status = error.response?.status;
    if (status === 401) {
      return {
        message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
        requiresLogin: true,
      };
    }
    if (status === 403) {
      return {
        message: "Backend từ chối API thùng rác (403). Hãy khởi động lại backend để áp dụng cấu hình SecurityConfig mới, rồi tải lại danh sách.",
        requiresLogin: false,
      };
    }
    if (!error.response) {
      return {
        message: "Không kết nối được dữ liệu. Vui lòng kết nối",
        requiresLogin: false,
      };
    }
    if (status >= 500) {
      return {
        message: `Backend trả lỗi ${status}. Hãy kiểm tra log backend và kết nối database.`,
        requiresLogin: false,
      };
    }
    return {
      message: error.response.data?.message || `Không thể tải dữ liệu (HTTP ${status}).`,
      requiresLogin: false,
    };
  };

  const fetchContacts = async (showTrash = viewingTrash) => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = showTrash ? await getTrashContacts() : await getContacts();
      const data = response.data?.data || response.data || [];
      setContacts(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách liên hệ:", error);
      setLoadError(getRequestError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (showTrash) => {
    setViewingTrash(showTrash);
    setSearchTerm("");
    setSelectedContact(null);
    fetchContacts(showTrash);
  };

  const handleViewDetails = async (id, openReply = false) => {
    setSelectedContact(null);
    setReplyOpen(openReply);
    setReplyMessage("");
    setDetailLoading(true);
    try {
      const response = await getContactById(id);
      const contact = response.data?.data || response.data;
      setSelectedContact(contact);
      setReplyMessage(contact.adminReply || "");
    } catch (error) {
      console.error("Lỗi khi tải chi tiết liên hệ:", error);
      showToast(getRequestError(error).message, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    setReplySaving(true);
    try {
      const response = await replyToContact(
        selectedContact.id,
        replyMessage.trim(),
      );
      const updatedContact = response.data?.data || response.data;
      setSelectedContact(updatedContact);
      setReplyMessage(updatedContact.adminReply || replyMessage.trim());
      setReplyOpen(false);
      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === updatedContact.id ? updatedContact : contact,
        ),
      );
      showToast("Đã lưu phản hồi trên hệ thống");
    } catch (error) {
      console.error("Lỗi khi lưu phản hồi liên hệ:", error);
      showToast(getRequestError(error).message, "error");
    } finally {
      setReplySaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteMode === "permanent") {
        await forceDeleteContact(deleteConfirmId);
      } else {
        await deleteContact(deleteConfirmId);
      }
      setContacts((currentContacts) =>
        currentContacts.filter((contact) => contact.id !== deleteConfirmId),
      );
      if (selectedContact?.id === deleteConfirmId) {
        setSelectedContact(null);
      }
      setDeleteConfirmId(null);
      showToast(
        deleteMode === "permanent"
          ? "Đã xóa vĩnh viễn liên hệ"
          : "Đã chuyển liên hệ vào thùng rác",
      );
    } catch (error) {
      console.error("Lỗi khi xóa liên hệ:", error);
      showToast(getRequestError(error).message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreContact(id);
      setContacts((currentContacts) =>
        currentContacts.filter((contact) => contact.id !== id),
      );
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
      showToast("Khôi phục liên hệ thành công");
    } catch (error) {
      console.error("Lỗi khi khôi phục liên hệ:", error);
      showToast(getRequestError(error).message, "error");
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    [
      contact.name,
      contact.email,
      contact.phone,
      contact.subject,
      contact.message,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("vi-VN");
  };

  const phoneLink = (phone) => phone?.replace(/[^\d+]/g, "");

  return (
    <AdminLayout title="Quản Lý Liên Hệ">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {viewingTrash ? "Thùng Rác Liên Hệ" : "Liên Hệ"}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {viewingTrash
                ? "Khôi phục liên hệ hoặc xóa vĩnh viễn khỏi hệ thống."
                : "Xem nội dung, liên hệ khách hàng hoặc chuyển liên hệ vào thùng rác."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleViewChange(!viewingTrash)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              {viewingTrash ? <MessageSquare className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              {viewingTrash ? "Danh sách liên hệ" : "Thùng rác"}
            </button>
            <button
              type="button"
              onClick={() => fetchContacts()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Tải lại
            </button>
          </div>
        </div>

        {loadError && (
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            <span>{loadError.message}</span>
            {loadError.requiresLogin && (
              <Link
                to="/login"
                className="shrink-0 rounded-lg bg-rose-700 px-3 py-2 text-center text-xs font-bold text-white hover:bg-rose-800"
              >
                Đăng nhập lại
              </Link>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm tên, email, số điện thoại..."
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-bold border-b border-stone-200/70">
                <tr>
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-4">Tiêu đề</th>
                  <th className="py-3.5 px-4">Nội dung</th>
                  <th className="py-3.5 px-4">Ngày gửi</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      Đang tải danh sách liên hệ...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      {searchTerm
                        ? "Không tìm thấy liên hệ phù hợp"
                        : viewingTrash
                          ? "Thùng rác đang trống"
                          : "Chưa có liên hệ nào"}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{contact.name}</div>
                        <div className="text-xs text-stone-500">
                          {contact.email}
                        </div>
                        {contact.phone && (
                          <a
                            href={`tel:${phoneLink(contact.phone)}`}
                            className="block text-xs text-stone-500 hover:text-amber-800"
                          >
                            {contact.phone}
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        {contact.subject || "Không có tiêu đề"}
                      </td>
                      <td className="py-3 px-4 text-stone-600 max-w-sm truncate">
                        {contact.message || "-"}
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-500 whitespace-nowrap">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(contact.id)}
                            title="Xem chi tiết liên hệ"
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!viewingTrash && (
                            <button
                              type="button"
                              onClick={() => handleViewDetails(contact.id, true)}
                              title="Phản hồi khách hàng trên website"
                              className="p-1.5 text-stone-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {viewingTrash ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestore(contact.id)}
                                title="Khôi phục liên hệ"
                                className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteMode("permanent");
                                  setDeleteConfirmId(contact.id);
                                }}
                                title="Xóa vĩnh viễn"
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteMode("soft");
                                setDeleteConfirmId(contact.id);
                              }}
                              title="Chuyển vào thùng rác"
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`fixed right-5 top-5 z-[70] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
            notification.type === "error"
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
          role="status"
        >
          {notification.message}
        </div>
      )}

      {(detailLoading || selectedContact) && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">Chi Tiết Liên Hệ</h2>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {detailLoading ? (
              <div className="py-12 text-center text-stone-500">
                Đang tải chi tiết...
              </div>
            ) : selectedContact && (
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Khách hàng
                  </div>
                  <div className="mt-1 font-semibold text-stone-900">{selectedContact.name}</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Email
                    </div>
                    <div className="mt-1 text-stone-800">
                      {selectedContact.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Số điện thoại
                    </div>
                    {selectedContact.phone ? (
                      <a
                        href={`tel:${phoneLink(selectedContact.phone)}`}
                        className="mt-1 inline-block text-amber-800 hover:underline"
                      >
                        {selectedContact.phone}
                      </a>
                    ) : (
                      <div className="mt-1 text-stone-500">Không cung cấp</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Tiêu đề
                  </div>
                  <div className="mt-1 text-stone-800">
                    {selectedContact.subject || "Không có tiêu đề"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Nội dung
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words rounded-xl bg-stone-50 p-3 text-stone-700">
                    {selectedContact.message || "Không có nội dung"}
                  </p>
                </div>
                <div className="text-xs text-stone-500">
                  Ngày gửi: {formatDate(selectedContact.createdAt)}
                </div>
                {!viewingTrash && (
                  <div className="border-t border-stone-100 pt-4">
                    {!replyOpen ? (
                      <div className="space-y-3">
                        {selectedContact.adminReply && (
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                              Phản hồi của cửa hàng
                            </div>
                            <p className="mt-1 whitespace-pre-wrap break-words rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-stone-700">
                              {selectedContact.adminReply}
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setReplyOpen(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
                        >
                          <Send className="w-4 h-4" />
                          {selectedContact.adminReply
                            ? "Chỉnh sửa phản hồi"
                            : "Phản hồi khách hàng"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label
                          htmlFor="contact-reply"
                          className="block text-xs font-bold uppercase tracking-wider text-stone-600"
                        >
                          Nội dung phản hồi
                        </label>
                        <textarea
                          id="contact-reply"
                          rows={5}
                          value={replyMessage}
                          onChange={(event) => setReplyMessage(event.target.value)}
                          placeholder="Nhập nội dung phản hồi cho khách hàng..."
                          className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-800 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                        />
                        <p className="text-xs text-stone-500">
                          Phản hồi sẽ được lưu trong hệ thống và hiển thị tại đây.
                        </p>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyMessage(selectedContact.adminReply || "");
                              setReplyOpen(false);
                            }}
                            disabled={replySaving}
                            className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveReply}
                            disabled={!replyMessage.trim() || replySaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {replySaving ? "Đang lưu..." : "Lưu phản hồi"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900">
                  {deleteMode === "permanent"
                    ? "Xóa vĩnh viễn liên hệ này?"
                    : "Chuyển liên hệ vào thùng rác?"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {deleteMode === "permanent"
                    ? "Liên hệ sẽ bị xóa khỏi database và không thể khôi phục."
                    : "Bạn có thể khôi phục liên hệ trong thùng rác."}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting
                  ? "Đang xử lý..."
                  : deleteMode === "permanent"
                    ? "Xóa vĩnh viễn"
                    : "Chuyển vào thùng rác"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
