
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { getPosts } from "../../services/postApi";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getPosts();
        const raw = res.data?.data ?? res.data;

        // Chỉ nhận danh sách thật từ API
        if (!Array.isArray(raw)) {
          throw new Error("Dữ liệu bài viết trả về không đúng định dạng.");
        }

        if (isMounted) {
          setPosts(raw);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách bài viết:", err);

        if (isMounted) {
          setPosts([]);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Không thể tải danh sách bài viết."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const topics = [
    "all",
    ...new Set(posts.map((p) => p.topicName).filter(Boolean)),
  ];

  const filteredPosts = posts.filter((p) => {
    const keyword = searchTerm.trim().toLowerCase();

    const matchesSearch =
      (p.title || "").toLowerCase().includes(keyword) ||
      (p.summary || p.description || "").toLowerCase().includes(keyword) ||
      (p.content || p.detail || "").toLowerCase().includes(keyword);

    const matchesTopic =
      selectedTopic === "all" || p.topicName === selectedTopic;

    return matchesSearch && matchesTopic;
  });

  return (
    <PublicLayout>
      {/* BREADCRUMB */}
      <div className="bg-[#f7f5f2] border-b border-stone-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <Link to="/" className="hover:text-amber-800 transition-colors">
            Home
          </Link>
          <span className="mx-2 text-stone-400">/</span>
          <span className="text-stone-800">Blog &amp; Bài viết</span>
        </div>
      </div>

      {/* BANNER */}
      <section className="bg-[#faf8f5] py-14 border-b border-stone-200 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-[3px] text-amber-800 block mb-2">
            Coffee Stories &amp; Culture
          </span>

          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
            Góc Cà Phê &amp; Chia Sẻ
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Khám phá những câu chuyện thú vị về nguồn gốc hạt cà phê,
            kỹ thuật pha chế và cảm hứng sáng tạo cùng tách cà phê mỗi ngày.
          </p>
        </div>
      </section>

      {/* CONTENT & FILTER */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search & Topic Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 mb-10 border-b border-stone-200">
            <div className="flex flex-wrap gap-2 items-center">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedTopic === topic
                      ? "bg-amber-800 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {topic === "all" ? "Tất cả bài viết" : topic}
                </button>
              ))}
            </div>

            <div className="w-full md:w-72 relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-full text-xs focus:outline-none focus:border-amber-800"
              />
              <span className="absolute left-3 top-2.5 text-stone-400 text-xs">
                
              </span>
            </div>
          </div>

          {/* POST LIST */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-amber-800 mb-3" />
              <p className="text-sm text-stone-500">
                Đang tải bài viết...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-amber-800 px-5 py-2 text-white hover:bg-amber-900"
              >
                Thử lại
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-lg mb-2">
                Không tìm thấy bài viết nào phù hợp
              </p>
              <p className="text-sm">
                Hãy thử từ khóa khác hoặc kiểm tra dữ liệu bài viết.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                // Hỗ trợ tên trường có thể dùng trong DTO backend
                const image = post.thumbnail || post.image;
                const summary =
                  post.summary || post.description || post.content || post.detail;
                const createdAt = post.createdAt || post.created_at;
                const author = post.username;

                return (
                  <article
                    key={post.id}
                    className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    {/* THUMBNAIL */}
                    <div className="relative h-56 overflow-hidden bg-stone-100">
                      {image && (
                        <img
                          src={image}
                          alt={post.title || "Bài viết"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      {post.topicName && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-amber-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                          {post.topicName}
                        </span>
                      )}
                    </div>

                    {/* BODY */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
                          {author && <span>👤 {author}</span>}

                          {createdAt && (
                            <>
                              {author && <span>•</span>}
                              <span>
                                📅{" "}
                                {new Date(createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="font-heading font-semibold text-stone-900 text-lg sm:text-xl leading-snug mb-3 group-hover:text-amber-800 transition-colors">
                          <Link to={`/blog/${post.id}`}>
                            {post.title}
                          </Link>
                        </h2>

                        {summary && (
                          <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                            {summary}
                          </p>
                        )}
                      </div>

                      <Link
                        to={`/blog/${post.id}`}
                        className="text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 inline-flex items-center gap-1 mt-auto pt-4 border-t border-stone-100"
                      >
                        Đọc tiếp <span>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
