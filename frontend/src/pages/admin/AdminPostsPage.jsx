import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Edit2,
  FileText,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  adminCreatePost,
  adminGetDeletedPosts,
  adminGetPosts,
  adminGetTopics,
  adminPermanentlyDeletePost,
  adminRestorePost,
  adminSoftDeletePost,
  adminUpdatePost,
  adminUploadImage,
} from "../../services/adminApi";
import Pagination from "../../components/Pagination";



const emptyForm = {
  title: "",
  alias: "",
  summary: "",
  content: "",
  thumbnail: "",
  topicId: "",
  status: 1,
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const showNotice = (message, type = "success") => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const response = await adminUploadImage(file);
      setForm((current) => ({ ...current, thumbnail: response.data.url }));
      showNotice("Tải ảnh lên thành công");
    } catch (error) {
      console.error("Lỗi khi tải ảnh bài viết:", error);
      showNotice(error.response?.data?.message || "Không thể tải ảnh lên", "error");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [postResponse, topicResponse] = await Promise.all([
        tab === "active" ? adminGetPosts() : adminGetDeletedPosts(),
        adminGetTopics(),
      ]);
      setPosts(postResponse.data?.data || []);
      setTopics(topicResponse.data?.data || []);
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
      showNotice("Không thể tải dữ liệu bài viết", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  // Đổi tab hoặc tìm kiếm thì quay về trang đầu
  useEffect(() => {
    setPage(1);
  }, [tab, search]);
  const openCreate = () => {
    setEditingPost(null);
    setForm({ ...emptyForm, topicId: topics[0]?.id || "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || "",
      alias: post.alias || "",
      summary: post.summary || "",
      content: post.content || "",
      thumbnail: post.thumbnail || "",
      topicId: post.topicId || "",
      status: post.status ?? 1,
    });
    setFormError("");
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setFormError("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    setSubmitting(true);
    setFormError("");
    const payload = {
      ...form,
      title: form.title.trim(),
      alias: form.alias.trim() || form.title.trim().toLowerCase().replace(/\s+/g, "-"),
      summary: form.summary.trim(),
      content: form.content.trim(),
      thumbnail: form.thumbnail.trim(),
      topicId: form.topicId ? Number(form.topicId) : null,
      status: Number(form.status),
    };

    try {
      if (editingPost) {
        await adminUpdatePost(editingPost.id, payload);
        showNotice("Cập nhật bài viết thành công");
      } else {
        await adminCreatePost(payload);
        showNotice("Thêm bài viết thành công");
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi khi lưu bài viết:", error);
      setFormError(error.response?.data?.message || "Không thể lưu bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  const softDelete = async (post) => {
    if (!window.confirm(`Đưa bài viết "${post.title}" vào thùng rác?`)) return;
    try {
      await adminSoftDeletePost(post.id);
      showNotice("Đã đưa bài viết vào thùng rác");
      loadData();
    } catch (error) {
      console.error("Lỗi khi xóa mềm bài viết:", error);
      showNotice("Không thể xóa bài viết", "error");
    }
  };

  const restore = async (post) => {
    try {
      await adminRestorePost(post.id);
      showNotice("Khôi phục bài viết thành công");
      loadData();
    } catch (error) {
      console.error("Lỗi khi khôi phục bài viết:", error);
      showNotice("Không thể khôi phục bài viết", "error");
    }
  };

  const permanentlyDelete = async (post) => {
    if (!window.confirm("Xóa vĩnh viễn bài viết này? Hành động không thể hoàn tác.")) return;
    try {
      await adminPermanentlyDeletePost(post.id);
      showNotice("Đã xóa vĩnh viễn bài viết");
      loadData();
    } catch (error) {
      console.error("Lỗi khi xóa vĩnh viễn bài viết:", error);
      showNotice("Không thể xóa vĩnh viễn bài viết", "error");
    }
  };

  const filteredPosts = posts.filter((post) =>
    `${post.title || ""} ${post.summary || ""}`.toLowerCase().includes(search.toLowerCase())
  );
  // Tổng số trang
  const totalPages = Math.ceil(filteredPosts.length / pageSize);

  // Danh sách bài viết của trang hiện tại
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, Math.max(totalPages, 1)));
  }, [totalPages]);

  return (
    <AdminLayout title="Quản Lý Bài Viết">
      <div className="space-y-6">
        {notice && (
          <div className={`fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${notice.type === "error"
            ? "border-rose-200 bg-rose-50 text-rose-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}>
            {notice.message}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Bài Viết</h1>
            <p className="mt-1 text-sm text-stone-500">Quản lý nội dung tin tức và bài viết của quán.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} title="Làm mới" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600 hover:bg-stone-50">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {tab === "active" && (
              <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800">
                <Plus className="h-4 w-4" /> Thêm bài viết
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button onClick={() => setTab("active")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === "active" ? "bg-amber-700 text-white" : "bg-stone-200 text-stone-600"}`}>
              Bài viết đang dùng
            </button>
            <button onClick={() => setTab("trash")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === "trash" ? "bg-rose-600 text-white" : "bg-stone-200 text-stone-600"}`}>
              Thùng rác
            </button>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài viết..." className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-700" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
          {loading ? (
            <div className="py-16 text-center text-stone-400">Đang tải bài viết...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-stone-400">Không có bài viết nào</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {paginatedPosts.map((post) => (
                <div key={post.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-stone-400">
                      {post.thumbnail ? <img src={post.thumbnail} alt="" className="h-full w-full object-cover" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-stone-800">{post.title}</p>
                      <p className="mt-1 truncate text-xs text-stone-500">{post.summary || "Chưa có mô tả"} {post.topicName ? `· ${post.topicName}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {tab === "active" ? (
                      <>
                        <button onClick={() => openEdit(post)} title="Sửa bài viết" className="rounded-lg p-2 text-stone-500 hover:bg-amber-50 hover:text-amber-800"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => softDelete(post)} title="Xóa mềm" className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => restore(post)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"><RotateCcw className="h-3.5 w-3.5" /> Khôi phục</button>
                        <button onClick={() => permanentlyDelete(post)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Xóa vĩnh viễn</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Phân trang */}
        {!loading && filteredPosts.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        {modalOpen && (

          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-900/60 p-4">
            <form onSubmit={submit} className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="text-lg font-bold text-stone-900">{editingPost ? "Sửa bài viết" : "Thêm bài viết"}</h2>
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700"><X className="h-5 w-5" /></button>
              </div>
              {formError && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
              <div className="grid gap-4">
                <label className="text-sm font-semibold text-stone-700">Tiêu đề
                  <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-normal outline-none focus:border-amber-700" />
                </label>
                <label className="text-sm font-semibold text-stone-700">Alias
                  <input value={form.alias} onChange={(event) => setForm({ ...form, alias: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-normal outline-none focus:border-amber-700" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-stone-700">Chủ đề
                    <select value={form.topicId} onChange={(event) => setForm({ ...form, topicId: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-normal outline-none">
                      <option value="">Không chọn chủ đề</option>
                      {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-stone-700">Trạng thái
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-normal outline-none">
                      <option value={1}>Hiển thị</option>
                      <option value={0}>Ẩn</option>
                    </select>
                  </label>
                </div>
                <label className="text-sm font-semibold text-stone-700">Ảnh đại diện
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="inline-flex cursor-pointer items-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                      {uploadingImage ? "Đang tải..." : "Chọn ảnh từ máy"}
                      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                    </span>
                    <input value={form.thumbnail} onChange={(event) => setForm({ ...form, thumbnail: event.target.value })} placeholder="Hoặc dán URL ảnh..." className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2.5 font-normal outline-none focus:border-amber-700" />
                  </div>
                  {form.thumbnail && <img src={form.thumbnail} alt="Xem trước" className="mt-2 h-20 w-32 rounded-xl border border-stone-200 object-cover" />}
                </label>
                <label className="text-sm font-semibold text-stone-700">Mô tả ngắn
                  <textarea rows={2} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-normal outline-none focus:border-amber-700" />
                </label>
                <label className="text-sm font-semibold text-stone-700">Nội dung
                  <textarea rows={7} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-normal outline-none focus:border-amber-700" />
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100">Hủy</button>
                <button disabled={submitting} className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50">{submitting ? "Đang lưu..." : "Lưu bài viết"}</button>
              </div>
            </form>
          </div>
        )}

      </div>

    </AdminLayout>
  );
}
