
import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";


import PublicLayout from "../../layouts/PublicLayout";
import ProductCard from "../../components/ProductCard";
import { getProductById, getProducts } from "../../services/productApi";
import { isLoggedIn } from "../../services/authApi";
import { addToCart } from "../../services/cartApi";
import { formatCurrency, resolveProductImage } from "../../utils/format";
import { addToCart } from "../../utils/cart";

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const resumedCartAction = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setRelated([]);
      setQuantity(1);

      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        const detailRes = await getProductById(id);

        if (cancelled) return;

        const currentProduct =
          detailRes.data?.data ?? detailRes.data;

        if (
          !currentProduct ||
          String(currentProduct.id) !== String(id)
        ) {
          setError("Không tìm thấy sản phẩm.");
          return;
        }

        setProduct(currentProduct);

        // Lấy danh sách sản phẩm từ backend
        try {
          const listRes = await getProducts();

          if (cancelled) return;

          const list = listRes.data?.data ?? listRes.data;

          if (Array.isArray(list)) {
            setRelated(
              list
                .filter(
                  (item) =>
                    String(item.id) !== String(id) &&
                    item.status !== 0 &&
                    item.status !== false
                )
                .slice(0, 4)
            );
          }
        } catch (err) {
          console.error("Không tải được danh sách sản phẩm:", err);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);

        if (!cancelled) {
          setError("Không thể tải thông tin sản phẩm từ máy chủ.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const pendingAction = location.state?.pendingCartAction;
    if (!product || !pendingAction || resumedCartAction.current) return;

    resumedCartAction.current = true;
    navigate(location.pathname, { replace: true, state: null });
    try {
      const productPrice = Number(product.price ?? 0);
      const salePrice = Number(product.salePrice ?? 0);
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: salePrice > 0 && salePrice < productPrice ? salePrice : productPrice,
        stock: Number(product.quantity ?? 0),
      }, pendingAction.quantity);

      if (pendingAction.buyNow) navigate("/cart");
      else setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (cartError) {
      setCartMessage(cartError.message);
    }
  }, [location.pathname, location.state, navigate, product]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <p className="text-stone-500">
            Đang tải dữ liệu...
          </p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h2 className="mb-4 text-2xl font-bold text-stone-800">
            {error || "Không tìm thấy sản phẩm."}
          </h2>

          <Link
            to="/products"
            className="inline-block rounded bg-amber-800 px-6 py-3 text-white hover:bg-amber-700"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const price = Number(product.price ?? 0);
  const salePrice =
    product.salePrice != null &&
    product.salePrice !== "" &&
    Number(product.salePrice) > 0 &&
    Number(product.salePrice) < price
      ? Number(product.salePrice)
      : null;

  const currentPrice = salePrice ?? price;
  const addCurrentProductToCart = (buyNow = false) => {
    if (!isLoggedIn()) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Vui lòng đăng nhập hoặc đăng ký để mua hàng.",
          pendingCartAction: { quantity, buyNow },
        },
      });
      return false;
    }

    try {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: currentPrice,
        stock,
      }, quantity);
      setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
      return true;
    } catch (cartError) {
      setCartMessage(cartError.message);
      return false;
    }
  };

  const categoryName =
    typeof product.category === "object" &&
    product.category !== null
      ? product.category.name
      : product.category ?? product.categoryName;

  const imageUrl = product.image
    ? resolveProductImage(product.image, product.id)
    : null;

  const stock = Number(product.quantity ?? 0);

  const handleQuantityChange = (value) => {
    const nextQuantity = Number(value);

    if (
      Number.isInteger(nextQuantity) &&
      nextQuantity >= 1 &&
      nextQuantity <= stock
    ) {
      setQuantity(nextQuantity);
    }
  };

  const cartProduct = {
    id: product.id,
    name: product.name,
    price: currentPrice,
    image: product.image,
    stock,
    unit: product.unit,
  };

  const handleAddToCart = () => {
    addToCart(cartProduct, quantity);
  };

  const handleBuyNow = () => {
    addToCart(cartProduct, quantity);
    navigate("/cart");
  };

  return (
    <PublicLayout>
      {/* Đường dẫn điều hướng */}
      <div className="border-b border-stone-200 bg-[#f7f5f2] py-3">
        <div className="mx-auto max-w-7xl px-4 text-sm text-stone-500">
          <Link to="/" className="hover:text-amber-800">
            Trang chủ
          </Link>

          <span className="mx-2">/</span>

          <Link to="/products" className="hover:text-amber-800">
            Sản phẩm
          </Link>

          <span className="mx-2">/</span>

          <span className="text-stone-800">
            {product.name}
          </span>
        </div>
      </div>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:gap-16">
            {/* Hình ảnh từ backend */}
            <div className="relative flex min-h-80 items-center justify-center rounded-2xl border border-stone-200 bg-[#f8f6f2] p-8 sm:p-12">
              {product.tag && (
                <span className="absolute left-4 top-4 rounded bg-amber-800 px-3 py-1 text-xs text-white">
                  {product.tag}
                </span>
              )}

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="max-h-[420px] max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            {/* Thông tin sản phẩm từ backend */}
            <div>
              {categoryName && (
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-800">
                  {categoryName}
                </p>
              )}

              <h1 className="mb-5 text-3xl font-bold text-stone-900 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mb-6 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-amber-800">
                  {formatCurrency(currentPrice)}
                </span>

                {salePrice !== null && (
                  <span className="text-lg text-stone-400 line-through">
                    {formatCurrency(price)}
                  </span>
                )}
              </div>

              {product.summary && (
                <p className="mb-6 border-b border-stone-200 pb-6 text-sm leading-relaxed text-stone-600">
                  {product.summary}
                </p>
              )}

              {/* Thông tin tồn kho từ backend */}
              <div className="mb-6 space-y-3 border-b border-stone-200 pb-6 text-sm">
                {product.quantity != null && (
                  <div className="flex gap-3">
                    <span className="w-32 shrink-0 font-semibold text-stone-800">
                      Số lượng:
                    </span>

                    <span
                      className={
                        stock > 0
                          ? "text-emerald-700"
                          : "text-red-600"
                      }
                    >
                      {stock}
                      {product.unit ? ` ${product.unit}` : ""}
                    </span>
                  </div>
                )}

                {product.unit && (
                  <div className="flex gap-3">
                    <span className="w-32 shrink-0 font-semibold text-stone-800">
                      Đơn vị:
                    </span>
                    <span>{product.unit}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <span className="w-32 shrink-0 font-semibold text-stone-800">
                    Mã sản phẩm:
                  </span>
                  <span>{product.id}</span>
                </div>
              </div>

              {/* Chọn số lượng */}
              {stock > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <div className="flex items-center overflow-hidden rounded border border-stone-300">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(quantity - 1)
                      }
                      disabled={quantity <= 1}
                      className="h-11 w-10 disabled:opacity-40"
                    >
                      -
                    </button>

                    <span className="flex h-11 w-12 items-center justify-center border-x border-stone-300">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(quantity + 1)
                      }
                      disabled={quantity >= stock}
                      className="h-11 w-10 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {stock > 0 && (
                <div className="mb-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={addCurrentProductToCart}
                    className="rounded-lg border border-amber-800 px-5 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-50"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (addCurrentProductToCart(true)) navigate("/cart");
                    }}
                    className="rounded-lg bg-amber-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-900"
                  >
                    Mua ngay
                  </button>
                </div>
              )}
              {cartMessage && (
                <p className="mb-5 text-sm font-medium text-amber-900" role="status">
                  {cartMessage}
                </p>
              )}

              {stock <= 0 && product.quantity != null && (
                <p className="mb-6 font-medium text-red-600">
                  Sản phẩm hiện đã hết hàng.
                </p>
              )}

              {stock > 0 && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="rounded-lg border border-amber-800 px-6 py-3 font-semibold text-amber-800 transition hover:bg-amber-50"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="rounded-lg bg-amber-800 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
                  >
                    Mua ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mô tả chi tiết từ backend */}
          {product.detail && (
            <div className="mt-12 border-t border-stone-200 pt-8">
              <h2 className="mb-5 text-xl font-bold text-stone-800">
                Mô tả chi tiết
              </h2>

              <div className="whitespace-pre-line text-sm leading-7 text-stone-600">
                {product.detail}
              </div>
            </div>
          )}

          {/* Sản phẩm liên quan từ backend */}
          {related.length > 0 && (
            <div className="mt-16 border-t border-stone-200 pt-10">
              <h2 className="mb-8 text-center text-2xl font-bold text-stone-800">
                Sản phẩm liên quan
              </h2>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {related.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}