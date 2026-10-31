import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Inbox,
  Mail,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import PublicLayout from "../../layouts/PublicLayout";
import {
  getMyContactReplies,
  sendContactMessage,
} from "../../services/contactApi";
import { markContactMessagesSeen } from "../../services/contactNotifications";

export default function ContactInboxPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageDrafts, setMessageDrafts] = useState({});
  const [sendingContactId, setSendingContactId] = useState(null);

  useEffect(() => {
    loadInbox();
    const refreshInbox = () => {
      if (document.visibilityState === "visible") loadInbox(true);
    };
    const intervalId = window.setInterval(refreshInbox, 30000);
    window.addEventListener("focus", refreshInbox);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshInbox);
    };
  }, []);

  const loadInbox = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const response = await getMyContactReplies();
      const inboxContacts = response.data?.data || [];
      setContacts(inboxContacts);
      markContactMessagesSeen(inboxContacts, "USER");
    } catch (requestError) {
      console.error("Lỗi khi tải hộp thư liên hệ:", requestError);
      if (silent) return;
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        setError("Vui lòng đăng nhập để xem phản hồi liên hệ.");
      } else if (!requestError.response) {
        setError("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
      } else {
        setError(
          requestError.response.data?.message ||
            "Không thể tải hộp thư. Vui lòng thử lại.",
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN");
  };

  const handleSendMessage = async (contact) => {
    const message = (messageDrafts[contact.id] || "").trim();
    if (!message) return;

    setSendingContactId(contact.id);
    setError("");
    try {
      const response = await sendContactMessage(contact.id, message);
      const updatedContact = response.data?.data || response.data;
      setContacts((currentContacts) =>
        currentContacts.map((item) =>
          item.id === updatedContact.id ? updatedContact : item,
        ),
      );
      setMessageDrafts((currentDrafts) => ({
        ...currentDrafts,
        [contact.id]: "",
      }));
    } catch (requestError) {
      console.error("Lỗi khi gửi tin nhắn liên hệ:", requestError);
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        setError("Vui lòng đăng nhập để trả lời tin nhắn.");
      } else if (!requestError.response) {
        setError("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
      } else {
        setError(
          requestError.response.data?.message ||
            "Không thể gửi tin nhắn. Vui lòng thử lại.",
        );
      }
    } finally {
      setSendingContactId(null);
    }
  };

  return (
    <PublicLayout>
      <section className="bg-[#faf8f5] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[3px] text-amber-800">
                Tài khoản của bạn
              </span>
              <h1 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
                Hộp thư phản hồi
              </h1>
              <p className="mt-2 text-sm text-stone-600">
                Xem phản hồi từ cửa hàng về những liên hệ bạn gửi khi đã đăng nhập.
              </p>
            </div>
            <button
              type="button"
              onClick={loadInbox}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Tải lại
            </button>
          </div>

          {error && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{error}</p>
                {(error.includes("đăng nhập") || error.includes("Đăng nhập")) && (
                  <Link
                    to="/login"
                    className="mt-2 inline-block font-bold underline underline-offset-2"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-500">
              Đang tải hộp thư...
            </div>
          ) : !error && contacts.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
              <Inbox className="mx-auto h-10 w-10 text-stone-300" />
              <h2 className="mt-4 font-semibold text-stone-800">
                Chưa có phản hồi nào
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                Hãy đăng nhập trước khi gửi liên hệ để cửa hàng có thể gắn phản hồi
                vào hộp thư tài khoản của bạn.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
              >
                <Mail className="h-4 w-4" />
                Gửi liên hệ
              </Link>
            </div>
          ) : !error ? (
            <div className="space-y-5">
              {contacts.map((contact) => (
                <article
                  key={contact.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                >
                  <div className="border-b border-stone-100 bg-stone-50 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="font-semibold text-stone-900">
                        {contact.subject || "Liên hệ"}
                      </h2>
                      <span className="text-xs text-stone-500">
                        {formatDate(contact.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-4 p-5 sm:p-6">
                    <div className="space-y-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                        <MessageSquare className="h-4 w-4" />
                        Cuộc trò chuyện
                      </div>
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-3">
                          <p className="mb-1 text-xs font-semibold text-stone-500">
                            Bạn · {formatDate(contact.createdAt)}
                          </p>
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700">
                            {contact.message}
                          </p>
                        </div>
                      </div>
                      {(contact.messages || []).map((message) => {
                        const isAdmin = message.senderRole === "ADMIN";
                        return (
                          <div
                            key={message.id ?? `${message.senderRole}-${message.createdAt}`}
                            className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                isAdmin
                                  ? "rounded-tr-sm border border-amber-100 bg-amber-50"
                                  : "rounded-tl-sm bg-stone-100"
                              }`}
                            >
                              <p className={`mb-1 text-xs font-semibold ${isAdmin ? "text-amber-800" : "text-stone-500"}`}>
                                {isAdmin ? "Cửa hàng" : "Bạn"} · {formatDate(message.createdAt)}
                              </p>
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-800">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {!contact.adminReply && (contact.messages || []).length === 0 && (
                        <p className="text-center text-xs italic text-stone-500">
                          Cửa hàng đã tiếp nhận câu hỏi và sẽ phản hồi tại đây.
                        </p>
                      )}
                    </div>
                    <div className="border-t border-stone-100 pt-4">
                      <label
                        htmlFor={`contact-message-${contact.id}`}
                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-600"
                      >
                        Trả lời cửa hàng
                      </label>
                      <textarea
                        id={`contact-message-${contact.id}`}
                        rows={3}
                        value={messageDrafts[contact.id] || ""}
                        onChange={(event) =>
                          setMessageDrafts((currentDrafts) => ({
                            ...currentDrafts,
                            [contact.id]: event.target.value,
                          }))
                        }
                        placeholder="Nhập tin nhắn của bạn..."
                        className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-800 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendMessage(contact)}
                          disabled={!(messageDrafts[contact.id] || "").trim() || sendingContactId === contact.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                          {sendingContactId === contact.id ? "Đang gửi..." : "Gửi tin nhắn"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </PublicLayout>
  );
}
