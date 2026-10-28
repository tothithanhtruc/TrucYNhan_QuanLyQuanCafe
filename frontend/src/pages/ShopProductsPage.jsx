import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productApi";
import { getCategories } from "../services/categoryApi";
import { resolveCategoryImage, formatCurrency } from "../utils/format";
import Pagination from "../components/Pagination";
const SORT_OPTIONS = [
  { value: "default", label: "Alphabetically, A-Z" },
  { value: "name-desc", label: "Alphabetically, Z-A" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

function mapProduct(p) {
  const currentPrice = Number(p.salePrice ?? p.price ?? 0);
  const original = p.salePrice && p.price && Number(p.salePrice) < Number(p.price)
    ? Number(p.price)
    : undefined;

  return {
    id: p.id,
    name: p.name ?? "Cà phê",
    category: p.category?.name ?? p.categoryName ?? "Cà phê",
    categoryId: p.category?.id ?? p.categoryId ?? null,
    price: currentPrice,
    originalPrice: original,
    rating: 5,
    badge: p.tag ?? (p.salePrice ? "sale" : null),
    image: p.image,
    quantity: p.quantity ?? 100,
  };
}

export default function ShopProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const [sort, setSort] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchKeyword);
  const ITEMS_PER_PAGE = 9;

  // Filters
  const [filters, setFilters] = useState({
    inStock: false,
    outOfStock: false,
    priceFrom: "",
    priceTo: "",
  });

  useEffect(() => {
    setSearchInput(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([getProducts(), getCategories()])
      .then(([prodRes, catRes]) => {
        let loadedProducts = [];
        if (prodRes.status === "fulfilled") {
          const raw = prodRes.value.data?.data ?? prodRes.value.data;
          if (Array.isArray(raw)) {
            loadedProducts = raw.map(mapProduct);
            setProducts(loadedProducts);
          }
        }

        if (catRes.status === "fulfilled") {
          const rawCats = catRes.value.data?.data ?? catRes.value.data;
          if (Array.isArray(rawCats)) {
            const mappedCats = rawCats.map((c) => {
              const count = loadedProducts.filter((p) => p.categoryId === c.id).length;
              return {
                id: c.id,
                name: c.name,
                image: c.image,
                count: count > 0 ? count : (c.productCount ?? 5),
              };
            });
            setCategories(mappedCats);
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApplySearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchParams({});
    setPage(1);
  };

  // Filter & sort logic
  const filtered = products
    .filter((p) => (activeCat === null ? true : p.categoryId === activeCat))
    .filter((p) => {
      if (!searchKeyword.trim()) return true;
      return p.name.toLowerCase().includes(searchKeyword.trim().toLowerCase());
    })
    .filter((p) => {
      if (filters.inStock && p.quantity <= 0) return false;
      if (filters.outOfStock && p.quantity > 0) return false;
      if (filters.priceFrom && p.price < Number(filters.priceFrom)) return false;
      if (filters.priceTo && p.price > Number(filters.priceTo)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "default") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagedProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <PublicLayout>
      {/* ═══════════ BREADCRUMB ═══════════ */}
      <div className="bg-[#f7f5f2] border-b border-stone-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <Link to="/" className="hover:text-amber-800 transition-colors">
            Home
          </Link>
          <span className="mx-2 text-stone-400">/</span>
          <span className="text-stone-800">Products</span>
          {searchKeyword && (
            <>
              <span className="mx-2 text-stone-400">/</span>
              <span className="text-amber-800 font-bold">Tìm kiếm: &quot;{searchKeyword}&quot;</span>
            </>
          )}
        </div>
      </div>

      {/* ═══════════ CIRCLE CATEGORIES (theo hình 1) ═══════════ */}
      <section className="bg-white border-b border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 sm:gap-12 justify-center flex-wrap items-center">
            {/* Mục "All" */}
            <div
              onClick={() => {
                setActiveCat(null);
                setPage(1);
              }}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-28 h-28 rounded-full p-2 bg-[#f8f6f2] flex items-center justify-center transition-all duration-300 ${activeCat === null
                  ? "ring-2 ring-amber-800 shadow-md scale-105"
                  : "hover:ring-1 hover:ring-amber-600"
                  }`}
              >
                <img
                  src={resolveCategoryImage(null, 99)}
                  alt="All"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-heading font-semibold text-stone-800 text-sm mt-3 group-hover:text-amber-800 transition-colors">
                All Coffee
              </span>
              <span className="text-xs text-stone-400 mt-0.5">{products.length} Items</span>
            </div>

            {/* Các danh mục từ API */}
            {categories.slice(0, 5).map((cat, idx) => (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveCat(cat.id);
                  setPage(1);
                }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-28 h-28 rounded-full p-2 bg-[#f8f6f2] flex items-center justify-center transition-all duration-300 ${activeCat === cat.id
                    ? "ring-2 ring-amber-800 shadow-md scale-105"
                    : "hover:ring-1 hover:ring-amber-600"
                    }`}
                >
                  <img
                    src={resolveCategoryImage(cat.image, idx)}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="font-heading font-semibold text-stone-800 text-sm mt-3 group-hover:text-amber-800 transition-colors text-center max-w-[120px] truncate">
                  {cat.name}
                </span>
                <span className="text-xs text-stone-400 mt-0.5">{cat.count} Items</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MAIN CONTENT: SIDEBAR + PRODUCT GRID ═══════════ */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-10 items-start">

            {/* ──────── SIDEBAR FILTER ──────── */}
            <aside className="border-t lg:border-t-0 pt-6 lg:pt-0 space-y-6 divide-y divide-stone-200">
              {/* Availability */}
              <div className="pt-4 first:pt-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center justify-between">
                  Tình trạng
                </h4>
                <div className="space-y-2 text-sm text-stone-600">
                  <label className="flex items-center justify-between cursor-pointer hover:text-amber-800">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                        className="rounded border-stone-300 text-amber-800 focus:ring-amber-700"
                      />
                      Còn hàng
                    </span>
                    <span className="text-stone-400 text-xs">({products.filter(p => p.quantity > 0).length})</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer hover:text-amber-800">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.outOfStock}
                        onChange={(e) => setFilters({ ...filters, outOfStock: e.target.checked })}
                        className="rounded border-stone-300 text-amber-800 focus:ring-amber-700"
                      />
                      Hết hàng
                    </span>
                    <span className="text-stone-400 text-xs">({products.filter(p => p.quantity <= 0).length})</span>
                  </label>
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                  Giá
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.priceFrom}
                    onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                    className="w-1/2 px-2.5 py-1.5 border border-stone-300 rounded text-xs focus:outline-none focus:border-amber-800"
                  />
                  <span className="text-stone-400">-</span>
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.priceTo}
                    onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                    className="w-1/2 px-2.5 py-1.5 border border-stone-300 rounded text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                  Danh mục
                </h4>
                <div className="space-y-2 text-sm text-stone-600">
                  {categories.map((c) => (
                    <label
                      key={c.id}
                      onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
                      className="flex items-center justify-between cursor-pointer hover:text-amber-800"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeCat === c.id}
                          readOnly
                          className="rounded border-stone-300 text-amber-800 focus:ring-amber-700"
                        />
                        <span className="truncate max-w-[150px]">{c.name}</span>
                      </span>
                      <span className="text-stone-400 text-xs">({c.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weight Options */}
              <div className="pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                  Size
                </h4>
                <div className="space-y-1.5 text-sm text-stone-600">
                  {["10 OZ", "12 OZ", "24 OZ", "30 OZ", "40 OZ"].map((w, idx) => (
                    <label key={w} className="flex items-center justify-between cursor-pointer hover:text-amber-800">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-stone-300 text-amber-800" />
                        {w}
                      </span>
                      <span className="text-stone-400 text-xs">({(idx + 1) * 3})</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* ──────── MAIN PRODUCT AREA ──────── */}
            <div>
              {/* Active Search Banner */}
              {searchKeyword && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <span>
                      Đang tìm kiếm theo từ khóa: <strong>&quot;{searchKeyword}&quot;</strong> ({filtered.length} kết quả)
                    </span>
                  </div>
                  <button
                    onClick={handleClearSearch}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 underline ml-4"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              )}

              {/* Top toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-4 mb-8 gap-4">
                {/* Search box inside toolbar */}
                <form onSubmit={handleApplySearch} className="flex items-center max-w-xs w-full">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full pl-8 pr-7 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                    />
                    <ion-icon name="search-outline"></ion-icon>
                    {searchInput && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-2 text-[10px] text-stone-400 hover:text-stone-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </form>

                {/* View switcher & sort */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded border text-sm transition-colors ${viewMode === "grid"
                        ? "border-stone-800 text-stone-800 bg-stone-100"
                        : "border-stone-300 text-stone-400 hover:text-stone-700"
                        }`}
                      title="Grid view"
                    >
                      ▦
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded border text-sm transition-colors ${viewMode === "list"
                        ? "border-stone-800 text-stone-800 bg-stone-100"
                        : "border-stone-300 text-stone-400 hover:text-stone-700"
                        }`}
                      title="List view"
                    >
                      ≡
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 hidden sm:inline">Sort:</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="border border-stone-300 rounded px-3 py-1.5 text-xs text-stone-700 bg-white focus:outline-none focus:border-amber-800"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Products listing */}
              {loading ? (
                <div className="text-center py-20 text-stone-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-amber-800 mb-3"></div>
                  <p className="text-sm">Đang tải sản phẩm từ máy chủ...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-stone-400">
                  <p className="text-lg mb-2">☕ Không tìm thấy sản phẩm nào</p>
                  <p className="text-sm">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
                  {searchKeyword && (
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 px-4 py-2 bg-amber-800 text-white text-xs font-bold uppercase rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Xem tất cả sản phẩm
                    </button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {pagedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {pagedProducts.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.id}`}
                      className="flex flex-col sm:flex-row items-center gap-6 bg-white border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="w-32 h-32 bg-[#f8f6f2] rounded p-2 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={resolveCategoryImage(p.image, p.id)}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="text-xs text-stone-400 uppercase tracking-wider">
                          {p.category}
                        </span>
                        <h3 className="font-heading font-medium text-stone-900 text-lg my-1 group-hover:text-amber-800 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-xs text-stone-500 mb-2">⭐⭐⭐⭐⭐</p>
                        <span className="text-amber-800 font-bold text-base">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />

            </div>

          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
