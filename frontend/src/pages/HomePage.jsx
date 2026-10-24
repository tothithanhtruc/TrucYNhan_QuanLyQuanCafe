import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productApi";
import { getBanners } from "../services/bannerApi";

const FALLBACK_HERO = {
  title: "Test and aroma\nbrazilian Coffee.",
  subtitle: "Khám phá hương vị cà phê hảo hạng được tuyển chọn từ các vùng nguyên liệu trứ danh.",
  image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=85",
};

/** Chuyển đổi dữ liệu từ Spring Boot backend sang chuẩn ProductCard */
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
  };
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [hero, setHero] = useState(FALLBACK_HERO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getProducts(), getBanners()])
      .then(([prodRes, bannerRes]) => {
        if (prodRes.status === "fulfilled") {
          const raw = prodRes.value.data?.data ?? prodRes.value.data;
          if (Array.isArray(raw) && raw.length > 0) {
            setProducts(raw.slice(0, 8).map(mapProduct));
          }
        }

        if (bannerRes.status === "fulfilled") {
          const banners = bannerRes.value.data?.data ?? bannerRes.value.data;
          if (Array.isArray(banners) && banners.length > 0) {
            const b = banners[0];
            setHero({
              title: b.name ?? b.title ?? FALLBACK_HERO.title,
              subtitle: b.description ?? b.summary ?? FALLBACK_HERO.subtitle,
              image: b.image ?? FALLBACK_HERO.image,
            });
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      {/* ═══════════ HERO BANNER (ảnh 1) ═══════════ */}
      <section className="bg-[#f5f2ec] py-16 lg:py-24 overflow-hidden border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs tracking-[3px] uppercase text-stone-500 block mb-4 font-semibold">
              ORIGINAL COFFEE
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.15] mb-6 whitespace-pre-line">
              {hero.title}
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              {hero.subtitle}
            </p>
            <Link
              to="/products"
              className="inline-block bg-[#a0522d] hover:bg-[#854324] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded shadow transition-all duration-200"
            >
              Buy Now
            </Link>
          </div>
          <div className="relative">
            <img
              src={hero.image}
              alt="Coffee Beans"
              className="w-full h-80 sm:h-96 lg:h-[420px] object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE SECTION (ảnh 2) ═══════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
              alt="Espresso machine pouring"
              className="w-full h-64 sm:h-72 object-cover rounded-xl shadow-md"
            />
            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80"
              alt="Barista latte art"
              className="w-full h-64 sm:h-72 object-cover rounded-xl shadow-md mt-6"
            />
          </div>
          <div>
            <span className="text-xs tracking-[3px] uppercase text-stone-400 block mb-3 font-semibold">
              About our coffee
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-stone-900 leading-snug mb-6">
              Arabica &amp; Robusta New<br />Exclusive Coffee.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8">
              Chúng tôi kết hợp tinh tế giữa hạt Arabica thơm nồng quyến rũ và Robusta đậm đà đặc trưng vùng đất đỏ Tây Nguyên. Mọi khâu từ chọn hạt, rang mộc đến pha chế đều được chuẩn hóa theo tiêu chuẩn quốc tế.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/products"
                className="bg-[#a0522d] hover:bg-[#854324] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded shadow transition-all duration-200"
              >
                Shop Now
              </Link>
              <button
                className="w-12 h-12 rounded-full border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white flex items-center justify-center transition-all duration-200 text-sm"
                title="Khám phá video"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ RECENT PRODUCTS ═══════════ */}
      <section className="py-20 bg-[#faf8f5] border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs tracking-[3px] uppercase text-stone-500 block mb-2 font-medium">
              Discover recently
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-stone-900">
              Recent Products
            </h2>
          </div>

          {loading ? (
            <div className="text-center text-stone-500 py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-amber-800 mb-3"></div>
              <p className="text-sm">Đang tải sản phẩm từ máy chủ...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="text-center mt-14">
            <Link
              to="/products"
              className="inline-block border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white text-xs font-bold uppercase tracking-widest px-10 py-3.5 rounded transition-all duration-200"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
