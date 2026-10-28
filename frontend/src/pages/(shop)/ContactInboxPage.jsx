import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Inbox, Mail, MessageSquare, RefreshCw } from "lucide-react";
import PublicLayout from "../../layouts/PublicLayout";
import { getMyContactReplies } from "../../services/contactApi";

export default function ContactInboxPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMyContactReplies();
      setContacts(response.data?.data || []);
    } catch (requestError) {
      console.error("Lỗi khi tải hộp thư liên hệ:", requestError);
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
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN");
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
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                        <MessageSquare className="h-4 w-4" />
                        Nội dung bạn đã gửi
                      </div>
                      <p className="whitespace-pre-wrap break-words rounded-xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
                        {contact.message}
                      </p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                        <Mail className="h-4 w-4" />
                        Phản hồi từ cửa hàng
                      </div>
                      <p className="whitespace-pre-wrap break-words rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-relaxed text-stone-800">
                        {contact.adminReply}
                      </p>
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
