import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/productApi";
import { getBanners } from "../../services/bannerApi";
import { getPosts } from "../../services/postApi";

function mapProduct(p) {
  const price = Number(p.salePrice ?? p.sale_price ?? p.price ?? 0);
  const originalPrice = Number(p.price ?? 0);
  const tag = typeof p.tag === "string" ? p.tag.trim().toLowerCase() : "";

  return {
    id: p.id,
    name: p.name,
    category:
      p.category?.name ??
      p.categoryName ??
      p.category_name ??
      "",
    categoryId:
      p.category?.id ??
      p.categoryId ??
      p.category_id ??
      null,
    price,
    originalPrice:
      price > 0 && originalPrice > price
        ? originalPrice
        : undefined,
    rating: p.rating ?? 0,
    // view dùng để sắp xếp bán chạy
    view: Number(p.view ?? 0),
    // createdAt dùng để sắp xếp mới nhất
    createdAt: p.createdAt ?? p.created_at ?? null,
    tag,
    badge:
      tag ||
      (price > 0 && originalPrice > price ? "sale" : null),
    image: p.image,
  };
}

function selectSectionProducts(products, tag, sortProducts) {
  return products
    .filter((product) => product.tag === tag)
    .sort(sortProducts)
    .slice(0, 4);
}

export default function HomePage() {
  // State cho từng nhóm sản phẩm
  const [latestProducts, setLatestProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);

  // State cho bài viết
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  // State cho banner
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // State loading / error chung
  const [loading, setLoading] = useState(true);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [productError, setProductError] = useState("");
  const [bannerError, setBannerError] = useState("");

  const hero = banners[currentBannerIndex] ?? null;

  // Tải sản phẩm, banner và bài viết từ backend
  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      const [productResult, bannerResult, postResult] = await Promise.allSettled([
        getProducts(),
        getBanners(),
        getPosts(),
      ]);

      if (!isMounted) return;

      // Sản phẩm
      if (productResult.status === "fulfilled") {
        const response = productResult.value.data;
        const rawProducts = response?.data ?? response;
        if (Array.isArray(rawProducts)) {
          const mapped = rawProducts.map(mapProduct);

          const byDate = (a, b) => {
            if (!a.createdAt && !b.createdAt) return b.id - a.id;
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          };

          const byView = (a, b) =>
            (b.view || 0) - (a.view || 0) || byDate(a, b);
          // Mỗi khu vực chỉ hiển thị sản phẩm có đúng tag tương ứng.
          const latest = selectSectionProducts(mapped, "new", byDate);
          //const bestSelling = selectSectionProducts(mapped, "best", byView);
          const hot = selectSectionProducts(mapped, "hot", byView);

          setLatestProducts(latest);
          //setBestSellingProducts(bestSelling);
          setHotProducts(hot);

          // Khuyến mãi chỉ hiển thị sản phẩm được gắn tag "sale".
          const promo = selectSectionProducts(mapped, "sale", byDate);
          setPromoProducts(promo.slice(0, 4));
          setProductError("");
        } else {
          setLatestProducts([]);
          setBestSellingProducts([]);
          setHotProducts([]);
          setPromoProducts([]);
          setProductError("Dữ liệu sản phẩm không hợp lệ.");
        }
      } else {
        console.error("Lỗi tải sản phẩm:", productResult.reason);
        setLatestProducts([]);
        setBestSellingProducts([]);
        setHotProducts([]);
        setPromoProducts([]);
        setProductError("Không thể tải sản phẩm từ máy chủ.");
      }

      // Banner
      if (bannerResult.status === "fulfilled") {
        const response = bannerResult.value.data;
        const rawBanners = response?.data ?? response;
        if (Array.isArray(rawBanners)) {
          const activeBanners = rawBanners
            .filter(
              (banner) =>
                Number(banner.status) === 1 &&
                typeof banner.image === "string" &&
                banner.image.trim() !== ""
            )
            .sort(
              (a, b) =>
                Number(a.sortOrder ?? a.sort_order ?? 0) -
                Number(b.sortOrder ?? b.sort_order ?? 0)
            );
          setBanners(activeBanners);
          setCurrentBannerIndex(0);
          setBannerError(activeBanners.length === 0 ? "Chưa có banner đang hoạt động." : "");
        } else {
          setBanners([]);
          setBannerError("Dữ liệu banner trả về không hợp lệ.");
        }
      } else {
        console.error("Lỗi tải banner:", bannerResult.reason);
        setBanners([]);
        setBannerError("Không thể kết nối API banner.");
      }

      // Bài viết
      if (postResult.status === "fulfilled") {
        const response = postResult.value.data;
        const rawPosts = response?.data ?? response;
        if (Array.isArray(rawPosts)) {
          setPosts(rawPosts.slice(0, 4));
          setPostsError("");
        } else {
          setPosts([]);
          setPostsError("Dữ liệu bài viết không hợp lệ.");
        }
      } else {
        console.error("Lỗi tải bài viết:", postResult.reason);
        setPosts([]);
        setPostsError("Không thể tải bài viết.");
      }

      setLoading(false);
      setBannerLoading(false);
      setPostsLoading(false);
    }

    loadHomeData().catch((error) => {
      console.error("Lỗi tải dữ liệu trang chủ:", error);
      if (isMounted) {
        setProductError("Đã xảy ra lỗi khi tải sản phẩm.");
        setBannerError("Đã xảy ra lỗi khi tải banner.");
        setPostsError("Đã xảy ra lỗi khi tải bài viết.");
        setLoading(false);
        setBannerLoading(false);
        setPostsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Tự động chuyển banner sau mỗi 4 giây
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  // Chuyển tới banner trước
  const handlePreviousBanner = () => {
    setCurrentBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length
    );
  };

  // Chuyển tới banner tiếp theo
  const handleNextBanner = () => {
    setCurrentBannerIndex(
      (prev) => (prev + 1) % banners.length
    );
  };

  // Helper render section sản phẩm
  function ProductSection({ title, subtitle, products, viewAllLink }) {
    return (
      <section className="border-t border-stone-200 bg-[#faf8f5] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-14 text-center">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[3px] text-stone-500">
              {subtitle}
            </span>
            <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
              {title}
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center text-stone-500">
              Đang tải sản phẩm...
            </div>
          ) : productError ? (
            <p className="py-10 text-center text-red-600">{productError}</p>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-stone-500">
              Chưa có sản phẩm để hiển thị.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <Link
              to={viewAllLink ?? "/products"}
              className="inline-block rounded border-2 border-stone-800 px-10 py-3.5 text-xs font-bold uppercase tracking-widest text-stone-800 transition-all duration-200 hover:bg-stone-800 hover:text-white"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <PublicLayout>
      {/* HERO BANNER SLIDER */}
      <section className="relative w-full overflow-hidden bg-[#f5f2ec]">
        {bannerLoading ? (
          <div className="flex min-h-[500px] items-center justify-center text-stone-500">
            Đang tải banner...
          </div>
        ) : hero ? (
          <div className="relative min-h-[500px] w-full sm:min-h-[600px] lg:min-h-[720px]">
            {/* Ảnh nền phủ toàn bộ banner */}
            <img
              key={`image-${hero.id ?? currentBannerIndex}`}
              src={hero.image}
              alt={hero.name ?? hero.title ?? "Banner quán cà phê"}
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                setBannerError("Không tải được ảnh banner.");
              }}
            />

            {/* Lớp phủ tối giúp chữ dễ đọc */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Nội dung nằm đè lên ảnh */}
            <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl items-center px-6 py-20 sm:min-h-[600px] lg:min-h-[720px] lg:px-4">
              <div className="max-w-3xl text-white">
                <span className="mb-5 block text-xs font-semibold uppercase tracking-[4px] text-white/80 sm:text-sm">
                  ORIGINAL COFFEE
                </span>

                <h1
                  key={`title-${hero.id ?? currentBannerIndex}`}
                  className="mb-7 max-w-3xl whitespace-pre-line font-heading text-4xl font-bold leading-[1.15] sm:text-5xl lg:text-7xl"
                >
                  {hero.name ?? hero.title ?? "Cà phê của chúng tôi"}
                </h1>

                {(hero.description || hero.summary) && (
                  <p className="mb-8 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {hero.description || hero.summary}
                  </p>
                )}

                <Link
                  to={
                    hero.link?.startsWith("/") && !hero.link.startsWith("//")
                      ? hero.link
                      : "/products"
                  }
                  className="inline-block rounded bg-[#a0522d] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#854324]"
                >
                  Xem cửa hàng
                </Link>
              </div>
            </div>

            {/* Nút chuyển banner */}
            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePreviousBanner}
                  aria-label="Banner trước"
                  className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl text-stone-900 shadow transition hover:bg-[#a0522d] hover:text-white sm:left-8"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={handleNextBanner}
                  aria-label="Banner tiếp theo"
                  className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl text-stone-900 shadow transition hover:bg-[#a0522d] hover:text-white sm:right-8"
                >
                  ›
                </button>
              </>
            )}

            {/* Chấm chọn banner */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                {banners.map((banner, index) => (
                  <button
                    key={banner.id ?? index}
                    type="button"
                    onClick={() => setCurrentBannerIndex(index)}
                    aria-label={`Chuyển đến banner ${index + 1}`}
                    aria-current={index === currentBannerIndex ? "true" : undefined}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentBannerIndex
                        ? "w-8 bg-[#a0522d]"
                        : "w-2.5 bg-white/70 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[500px] items-center justify-center px-4 text-center text-stone-600">
            {bannerError || "Chưa có banner để hiển thị."}
          </div>
        )}
      </section>

      {/* GIỚI THIỆU QUÁN */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
              alt="Pha chế cà phê"
              className="h-64 w-full rounded-xl object-cover shadow-md sm:h-72"
            />

            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80"
              alt="Nghệ thuật pha cà phê"
              className="mt-6 h-64 w-full rounded-xl object-cover shadow-md sm:h-72"
            />
          </div>

          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[3px] text-stone-400">
              About our coffee
            </span>

            <h2 className="mb-6 font-heading text-3xl font-bold leading-snug text-stone-900 sm:text-4xl">
              Arabica &amp; Robusta New
              <br />
              Exclusive Coffee.
            </h2>

            <p className="mb-8 text-sm leading-relaxed text-stone-600 sm:text-base">
              Chúng tôi chú trọng lựa chọn hạt cà phê chất lượng và mang đến
              hương vị đặc trưng trong từng tách cà phê.
            </p>

            <Link
              to="/products"
              className="inline-block rounded bg-[#a0522d] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow transition-all duration-200 hover:bg-[#854324]"
            >
              Xem cửa hàng
            </Link>
          </div>
        </div>
      </section>

      {/* SẢN PHẨM MỚI NHẤT */}
      <ProductSection
        title="Sản phẩm mới nhất"
        subtitle="Mới về"
        products={latestProducts}
        viewAllLink="/products"
      />

      {/* SẢN PHẨM HOT */}
      <ProductSection
        title="Sản phẩm hot"
        subtitle="Đang được quan tâm"
        products={hotProducts}
        viewAllLink="/products"
      />

      {/* SẢN PHẨM KHUYẾN MÃI */}
      {promoProducts.length > 0 && (
        <section className="border-t border-stone-200 bg-[#faf8f5] py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-14 text-center">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[3px] text-stone-500">
                Ưu đãi hot
              </span>
              <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
                Sản phẩm khuyến mãi
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-14 text-center">
              <Link
                to="/products"
                className="inline-block rounded border-2 border-stone-800 px-10 py-3.5 text-xs font-bold uppercase tracking-widest text-stone-800 transition-all duration-200 hover:bg-stone-800 hover:text-white"
              >
                Xem tất cả khuyến mãi
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* BÀI VIẾT MỚI NHẤT */}
      <section className="border-t border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-14 text-center">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[3px] text-stone-500">
              Tin tức
            </span>
            <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
              Bài viết mới nhất
            </h2>
          </div>

          {postsLoading ? (
            <div className="py-16 text-center text-stone-500">Đang tải bài viết...</div>
          ) : postsError ? (
            <p className="py-10 text-center text-red-600">{postsError}</p>
          ) : posts.length === 0 ? (
            <p className="py-10 text-center text-stone-500">Chưa có bài viết nào.</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group block overflow-hidden rounded-xl border border-stone-200 bg-[#faf8f5] shadow-sm transition hover:shadow-md"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title ?? "Bài viết"}
                      className="h-48 w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                  <div className="p-5">
                    <h3 className="mb-2 line-clamp-2 font-heading text-base font-bold text-stone-900 group-hover:text-[#a0522d]">
                      {post.title ?? "Bài viết"}
                    </h3>
                    {(post.summary || post.excerpt || post.description) && (
                      <p className="line-clamp-3 text-sm text-stone-500">
                        {post.summary ?? post.excerpt ?? post.description}
                      </p>
                    )}
                    <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-[#a0522d]">
                      Đọc thêm →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <Link
              to="/blog"
              className="inline-block rounded border-2 border-stone-800 px-10 py-3.5 text-xs font-bold uppercase tracking-widest text-stone-800 transition-all duration-200 hover:bg-stone-800 hover:text-white"
            >
              Xem tất cả bài viết
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
