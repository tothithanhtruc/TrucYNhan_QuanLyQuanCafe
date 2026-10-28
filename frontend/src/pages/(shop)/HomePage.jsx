import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/productApi";
import { getBanners } from "../../services/bannerApi";

function mapProduct(p) {
  const price = Number(p.salePrice ?? p.sale_price ?? p.price ?? 0);
  const originalPrice = Number(p.price ?? 0);

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
    badge:
      p.tag ??
      (price > 0 && originalPrice > price ? "sale" : null),
    image: p.image,
  };
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [productError, setProductError] = useState("");
  const [bannerError, setBannerError] = useState("");

  const hero = banners[currentBannerIndex] ?? null;

  // Tải sản phẩm và banner từ backend
  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      const [productResult, bannerResult] = await Promise.allSettled([
        getProducts(),
        getBanners(),
      ]);

      if (!isMounted) return;

      // Sản phẩm
      if (productResult.status === "fulfilled") {
        const response = productResult.value.data;
        const rawProducts = response?.data ?? response;

        if (Array.isArray(rawProducts)) {
          setProducts(rawProducts.slice(0, 8).map(mapProduct));
          setProductError("");
        } else {
          setProducts([]);
          setProductError("Dữ liệu sản phẩm không hợp lệ.");
        }
      } else {
        console.error("Lỗi tải sản phẩm:", productResult.reason);
        setProducts([]);
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
          setBannerError(
            activeBanners.length === 0
              ? "Chưa có banner đang hoạt động."
              : ""
          );
        } else {
          setBanners([]);
          setBannerError("Dữ liệu banner trả về không hợp lệ.");
        }
      } else {
        console.error("Lỗi tải banner:", bannerResult.reason);
        setBanners([]);
        setBannerError("Không thể kết nối API banner.");
      }

      setLoading(false);
      setBannerLoading(false);
    }

    loadHomeData().catch((error) => {
      console.error("Lỗi tải dữ liệu trang chủ:", error);

      if (isMounted) {
        setProductError("Đã xảy ra lỗi khi tải sản phẩm.");
        setBannerError("Đã xảy ra lỗi khi tải banner.");
        setLoading(false);
        setBannerLoading(false);
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

  return (
    <PublicLayout>
      {/* HERO BANNER SLIDER */}
      
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

      {/* SẢN PHẨM TỪ API */}
      <section className="border-t border-stone-200 bg-[#faf8f5] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-14 text-center">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[3px] text-stone-500">
              Khám phá
            </span>

            <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
              Sản phẩm gần đây
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center text-stone-500">
              Đang tải sản phẩm từ máy chủ...
            </div>
          ) : productError ? (
            <p className="py-10 text-center text-red-600">
              {productError}
            </p>
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
              to="/products"
              className="inline-block rounded border-2 border-stone-800 px-10 py-3.5 text-xs font-bold uppercase tracking-widest text-stone-800 transition-all duration-200 hover:bg-stone-800 hover:text-white"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}