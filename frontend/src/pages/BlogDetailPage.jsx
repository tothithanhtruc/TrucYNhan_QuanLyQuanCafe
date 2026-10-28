import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import { getPostById, getPosts } from "../services/postApi";

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    Promise.allSettled([getPostById(id), getPosts()])
      .then(([postRes, listRes]) => {
        if (postRes.status === "fulfilled") {
          const data = postRes.value.data?.data ?? postRes.value.data;
          if (data) {
            setPost(data);
          } else {
            setError("Không tìm thấy bài viết");
          }
        } else {
          // Fallback nếu bài viết mẫu
          setPost({
            id,
            title: "Bí quyết pha cà phê phin truyền thống thơm ngon đậm đà",
            summary: "Nghệ thuật pha cà phê phin không chỉ ở nhiệt độ nước mà còn phụ thuộc vào độ mịn hạt và tỉ lệ nén phin hoàn hảo.",
            content: `Cà phê phin từ lâu đã trở thành một biểu tượng bất hủ trong đời sống thường nhật của người Việt Nam. Từng giọt cà phê tí tách rơi xuống ly không chỉ là quá trình chiết xuất mà còn là khoảng lặng thư giãn, tận hưởng cuộc sống chậm rãi giữa nhịp sống hối hả.

              ### 1. Lựa chọn hạt cà phê đạt chuẩn
              Để có một ly cà phê phin chuẩn gu, nguyên liệu đóng vai trò quyết định đến 70%. Bạn nên chọn dòng Robusta mộc nguyên chất từ Buôn Ma Thuột kết hợp với 20-30% hạt Arabica Cầu Đất (Đà Lạt). Sự hòa quyện này mang đến vị đậm đà, béo ngậy đặc trưng kèm theo hương thơm thoang thoảng của hoa quả và hậu vị chua thanh tao nhã.

              ### 2. Kỹ thuật ủ và chiết xuất
              Nước dùng để pha cà phê lý tưởng nhất nên ở khoảng nhiệt độ từ 92°C đến 95°C. Đừng dùng nước vừa sôi sùng sục vì nhiệt độ quá cao sẽ làm khét tinh dầu cà phê.
              - Bước 1: Tráng phin bằng nước nóng để cân bằng nhiệt.
              - Bước 2: Cho 20-25g cà phê vào phin, lắc nhẹ cho phẳng bề mặt.
              - Bước 3: Rót khoảng 30ml nước sôi vào nắp và đáy phin để ủ trong vòng 1-2 phút. Giai đoạn ủ giúp bột cà phê nở đều và ngậm đủ nước.
              - Bước 4: Châm tiếp 50-60ml nước sôi còn lại và đậy nắp chờ giọt cà phê rơi đều đặn (khoảng 1 giọt/giây).

              ### 3. Thưởng thức theo phong cách riêng
              Tùy theo sở thích, bạn có thể thưởng thức đen đá nguyên bản để cảm nhận trọn vẹn từng tầng vị mộc mạc, hoặc thêm sữa đặc có đường để tạo nên ly 'cà phê nâu' trứ danh được bạn bè quốc tế ngợi ca.

              Hãy dành chút thời gian mỗi sáng để tự tay chuẩn bị một tách cà phê phin, hít hà hương thơm nồng nàn và bắt đầu một ngày mới thật nhiều năng lượng!`,
            thumbnail: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&q=85",
            topicName: "Kiến thức cà phê",
            username: "Barista Huy",
            createdAt: "2026-10-20T08:30:00",
          });
        }

        if (listRes.status === "fulfilled") {
          const list = listRes.value.data?.data ?? listRes.value.data;
          if (Array.isArray(list)) {
            setRecentPosts(list.filter((p) => String(p.id) !== String(id)).slice(0, 3));
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi tải bài viết:", err);
        setError("Không thể tải bài viết");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-stone-300 border-t-amber-800 mb-4"></div>
          <p className="text-stone-500 font-medium">Đang tải bài viết...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !post) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="font-heading text-2xl font-bold text-stone-800 mb-2">📰 {error || "Bài viết không tồn tại"}</h2>
          <Link
            to="/blog"
            className="inline-block bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors mt-4"
          >
            Quay lại trang Blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* ═══════════ BREADCRUMB ═══════════ */}
      <div className="bg-[#f7f5f2] border-b border-stone-200 py-3.5">
        <div className="max-w-4xl mx-auto px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <Link to="/" className="hover:text-amber-800 transition-colors">Home</Link>
          <span className="mx-2 text-stone-400">/</span>
          <Link to="/blog" className="hover:text-amber-800 transition-colors">Blog</Link>
          <span className="mx-2 text-stone-400">/</span>
          <span className="text-stone-800 truncate">{post.title}</span>
        </div>
      </div>

      {/* ═══════════ POST DETAIL ═══════════ */}
      <article className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4">

          {/* Header */}
          <div className="mb-8 text-center max-w-3xl mx-auto">
            {post.topicName && (
              <span className="inline-block bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                {post.topicName}
              </span>
            )}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
              <span>✍️ {post.username || "Tác giả Bickrost"}</span>
              <span>•</span>
              <span>📅 {post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}</span>
              <span>•</span>
              <span>⏱️ 5 phút đọc</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.thumbnail && (
            <div className="rounded-2xl overflow-hidden mb-12 shadow-md">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          {/* Summary Quote */}
          {post.summary && (
            <div className="border-l-4 border-amber-800 pl-6 py-2 my-8 bg-[#faf8f5] rounded-r-lg italic text-stone-700 text-base sm:text-lg leading-relaxed">
              &ldquo;{post.summary}&rdquo;
            </div>
          )}

          {/* Body Content */}
          <div className="prose prose-stone max-w-none text-stone-700 text-base leading-relaxed whitespace-pre-line space-y-4">
            {post.content}
          </div>

          {/* Share & Author bio */}
          <div className="mt-14 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 transition-colors"
            >
              <span>←</span> Quay lại danh sách bài viết
            </Link>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Chia sẻ:</span>
              <button className="px-3 py-1 border border-stone-200 rounded hover:bg-stone-50">Facebook</button>
              <button className="px-3 py-1 border border-stone-200 rounded hover:bg-stone-50">Twitter</button>
            </div>
          </div>

          {/* Recent / Related Posts */}
          {recentPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-stone-200">
              <h3 className="font-heading text-2xl font-bold text-stone-900 mb-8 text-center">
                Bài viết cùng chuyên mục
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {recentPosts.map((r) => (
                  <Link
                    key={r.id}
                    to={`/blog/${r.id}`}
                    className="group bg-[#faf8f5] border border-stone-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="h-40 overflow-hidden bg-stone-100">
                      <img
                        src={r.thumbnail || "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=80"}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-heading font-medium text-stone-800 text-sm line-clamp-2 group-hover:text-amber-800 transition-colors mb-2">
                        {r.title}
                      </h4>
                      <span className="text-[11px] text-stone-400">Đọc ngay →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </article>
    </PublicLayout>
  );
}
