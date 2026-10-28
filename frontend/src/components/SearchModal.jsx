import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../services/productApi";
import { formatCurrency, resolveProductImage } from "../utils/format";

export default function SearchModal({ isOpen, onClose }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setKeyword("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search khi người dùng gõ
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      searchProducts(keyword.trim())
        .then((res) => {
          const data = res.data?.data ?? res.data;
          if (Array.isArray(data)) {
            setResults(data);
          } else {
            setResults([]);
          }
        })
        .catch((err) => {
          console.error("Lỗi tìm kiếm sản phẩm:", err);
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelectProduct = (id) => {
    onClose();
    navigate(`/products/${id}`);
  };

  const handleSearchAll = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onClose();
    navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <form onSubmit={handleSearchAll} className="flex items-center px-6 py-4 border-b border-stone-200 gap-3">
          <span className="text-xl text-amber-800">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm cà phê đen, sữa, bạc xỉu, americano..."
            className="flex-1 text-base text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1 rounded-full bg-stone-100"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors"
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 text-lg leading-none"
            title="Đóng (Esc)"
          >
            ✕
          </button>
        </form>

        {/* Search Body / Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-12 text-center text-stone-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-stone-300 border-t-amber-800 mb-2"></div>
              <p className="text-xs">Đang tìm kiếm trong cơ sở dữ liệu...</p>
            </div>
          ) : keyword.trim() && results.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <p className="text-sm">Không tìm thấy sản phẩm nào khớp với &quot;{keyword}&quot;</p>
              <p className="text-xs mt-1 text-stone-500">Hãy thử tìm từ khóa khác như &quot;cà phê&quot;, &quot;trà&quot;, &quot;espresso&quot;</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-3 px-2">
                Kết quả tìm thấy ({results.length})
              </p>
              <div className="space-y-2">
                {results.map((item) => {
                  const catName =
                    typeof item.category === "object" && item.category !== null
                      ? item.category.name || "Cà phê"
                      : item.category || "Cà phê";
                  const price = Number(item.salePrice ?? item.price ?? 0);
                  const img = resolveProductImage(item.image, item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectProduct(item.id)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#faf8f5] transition-colors cursor-pointer group border border-transparent hover:border-stone-200"
                    >
                      <div className="w-14 h-14 bg-[#f8f6f2] rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center">
                        <img src={img} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-stone-400 uppercase tracking-widest block truncate">
                          {catName}
                        </span>
                        <h4 className="font-heading font-medium text-stone-800 text-sm group-hover:text-amber-800 transition-colors truncate">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-amber-800">
                          {formatCurrency(price)}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400 group-hover:text-amber-800 transition-colors pr-2">
                        →
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-center">
                <button
                  onClick={handleSearchAll}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900"
                >
                  Xem toàn bộ kết quả cho &quot;{keyword}&quot; trên trang sản phẩm →
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-stone-400">
              <span className="text-3xl block mb-2">☕</span>
              <p className="text-xs font-medium text-stone-500">
                Gõ tên món cà phê hoặc đồ uống bạn muốn tìm kiếm
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Cà phê sữa", "Bạc xỉu", "Americano", "Cà phê trứng", "Trà đào"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setKeyword(tag)}
                    className="text-xs bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-900 px-3 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
