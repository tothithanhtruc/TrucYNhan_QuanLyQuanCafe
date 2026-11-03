
import { useEffect, useRef, useState } from "react";
import {
  useParams,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import PublicLayout from "../../layouts/PublicLayout";
import ProductCard from "../../components/ProductCard";

import {
  getProductById,
  getProducts,
} from "../../services/productApi";

import { isLoggedIn } from "../../services/authApi";
import { addToCart } from "../../services/cartApi";

import {
  formatCurrency,
  resolveProductImage,
} from "../../utils/format";
import {
  getConfiguredUnitPrice,
  ICE_OPTIONS,
  isCakeProduct,
  SUGAR_OPTIONS,
  TOPPING_OPTIONS,
} from "../../utils/drinkCustomization";

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [sugarLevel, setSugarLevel] = useState("100%");
  const [iceLevel, setIceLevel] = useState("NORMAL");
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  const resumedCartAction = useRef(false);

  // Lấy thông tin sản phẩm
  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setRelated([]);
      setQuantity(1);
      setSugarLevel("100%");
      setIceLevel("NORMAL");
      setToppings([]);
      setCartMessage("");
      resumedCartAction.current = false;

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

        // Lấy danh sách sản phẩm liên quan
        try {
          const listRes = await getProducts();

          if (cancelled) return;

          const list =
            listRes.data?.data ?? listRes.data;

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
          console.error(
            "Không tải được danh sách sản phẩm:",
            err
          );
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);

        if (!cancelled) {
          setError(
            "Không thể tải thông tin sản phẩm từ máy chủ."
          );
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

  // Khôi phục thao tác thêm giỏ hàng sau khi đăng nhập
  useEffect(() => {
    const pendingAction =
      location.state?.pendingCartAction;

    if (
      !product ||
      !pendingAction ||
      resumedCartAction.current
    ) {
      return;
    }

    resumedCartAction.current = true;

    navigate(location.pathname, {
      replace: true,
      state: null,
    });

    const price = Number(product.price ?? 0);
    const salePrice = Number(
      product.salePrice ?? product.sale_price ?? 0
    );

    const currentPrice =
      salePrice > 0 && salePrice < price
        ? salePrice
        : price;

    const customization = pendingAction.customization || {
      sugarLevel: "100%",
      iceLevel: "NORMAL",
      toppings: [],
    };

    try {
      const cartItem = addToCart(
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: currentPrice,
          basePrice: currentPrice,
          stock: Number(product.quantity ?? 0),
          unit: product.unit,
          ...customization,
        },
        pendingAction.quantity
      );

      if (pendingAction.buyNow) {
        const buyNowItem = {
          id: product.id,
          name: product.name,
          image: product.image,
          price: getConfiguredUnitPrice(currentPrice, customization.toppings),
          basePrice: currentPrice,
          stock: Number(product.quantity ?? 0),
          quantity: pendingAction.quantity,
          cartLineId: cartItem.cartLineId,
          ...customization,
        };

        sessionStorage.setItem(
          "checkout-items",
          JSON.stringify([buyNowItem])
        );

        navigate("/checkout");
      } else {
        setCartMessage(
          "Đã thêm sản phẩm vào giỏ hàng."
        );
      }
    } catch (cartError) {
      setCartMessage(cartError.message);
    }
  }, [
    location.pathname,
    location.state,
    navigate,
    product,
  ]);

  // Trạng thái tải dữ liệu
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

  // Không tìm thấy sản phẩm
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

  // Thông tin giá và tồn kho
  const price = Number(product.price ?? 0);
  const salePriceValue = Number(
    product.salePrice ?? product.sale_price ?? 0
  );

  const salePrice =
    salePriceValue > 0 && salePriceValue < price
      ? salePriceValue
      : null;

  const currentPrice = salePrice ?? price;

  const stock = Number(product.quantity ?? 0);

  const categoryName =
    typeof product.category === "object" &&
      product.category !== null
      ? product.category.name
      : product.category ?? product.categoryName;
  const isCake = isCakeProduct({ ...product, categoryName });
  const selectedToppings = isCake ? [] : toppings;

  const imageUrl = product.image
    ? resolveProductImage(product.image, product.id)
    : null;

  // Chọn số lượng sản phẩm
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

  // Thêm sản phẩm vào giỏ hàng
  const addCurrentProductToCart = (buyNow = false) => {
    // Kiểm tra đăng nhập
    if (!isLoggedIn()) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message:
            "Vui lòng đăng nhập hoặc đăng ký để mua hàng.",
          pendingCartAction: {
            quantity,
            buyNow,
            customization: {
              sugarLevel: isCake ? "100%" : sugarLevel,
              iceLevel: isCake ? "NORMAL" : iceLevel,
              toppings: selectedToppings,
            },
          },
        },
      });

      return false;
    }

    try {
      addToCart(
        {
          id: product.id,
          name: product.name,
          image: product.image,
          categoryName,
          price: currentPrice,
          basePrice: currentPrice,
          stock,
          unit: product.unit,
          sugarLevel: isCake ? "100%" : sugarLevel,
          iceLevel: isCake ? "NORMAL" : iceLevel,
          toppings: selectedToppings,
        },
        quantity
      );

      setCartMessage(
        "Đã thêm sản phẩm vào giỏ hàng."
      );

      return true;
    } catch (cartError) {
      setCartMessage(cartError.message);
      return false;
    }
  };

  // Thêm vào giỏ
  const handleAddToCart = () => {
    addCurrentProductToCart();
  };


  const handleBuyNow = () => {
    //kiem tra dang nhap
    if (!isLoggedIn()) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message:
            "Vui lòng đăng nhập hoặc đăng ký để mua hàng.",
          pendingCartAction: {
            quantity,
            buyNow: true,
            customization: {
              sugarLevel: isCake ? "100%" : sugarLevel,
              iceLevel: isCake ? "NORMAL" : iceLevel,
              toppings: selectedToppings,
            },
          },
        },
      });
      return;
    }


    const buyNowItem = {
      id: product.id,
      name: product.name,
      image: product.image,
      categoryName,
      price: getConfiguredUnitPrice(currentPrice, selectedToppings),
      basePrice: currentPrice,
      stock,
      quantity,
      sugarLevel: isCake ? "100%" : sugarLevel,
      iceLevel: isCake ? "NORMAL" : iceLevel,
      toppings: selectedToppings,
    };

    sessionStorage.setItem(
      "checkout-items",
      JSON.stringify([buyNowItem])
    );

    navigate("/checkout");
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

          <Link
            to="/products"
            className="hover:text-amber-800"
          >
            Sản phẩm
          </Link>

          <span className="mx-2">/</span>

          <span className="text-stone-800">
            {product.name}
          </span>
        </div>
      </div>

    
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">

          {/* Đường dẫn điều hướng */}
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:gap-14">

            {/* Hình ảnh sản phẩm bên trái */}
            <div className="relative h-[360px] overflow-hidden rounded-2xl border border-stone-200 bg-[#faeedb] sm:h-[420px]">
              {product.tag && (
                <span className="absolute left-4 top-4 z-10 rounded bg-amber-800 px-3 py-1 text-xs font-semibold text-white">
                  {product.tag}
                </span>
              )}

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            {/* Thông tin sản phẩm bên phải */}
            <div className="min-w-0">

              {categoryName && (
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-800">
                  {categoryName}
                </p>
              )}

              <h1 className="mb-4 text-3xl font-bold text-stone-900">
                {product.name}
              </h1>

              {/* Giá sản phẩm */}
              <div className="mb-5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-amber-800">
                  {formatCurrency(
                    getConfiguredUnitPrice(currentPrice, selectedToppings)
                  )}
                </span>

                {salePrice !== null && (
                  <span className="text-base text-stone-400 line-through">
                    {formatCurrency(price)}
                  </span>
                )}
              </div>

              {/* Mô tả ngắn */}
              {product.summary && (
                <p className="mb-5 border-b border-stone-200 pb-5 text-sm leading-relaxed text-stone-600">
                  {product.summary}
                </p>
              )}

              {/* Tùy chỉnh đồ uống */}
              {!isCake && (
              <div className="space-y-4 border-b border-stone-200 pb-5">

                {/* Mức đường */}
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-stone-800">
                    Mức đường
                  </legend>

                  <div className="flex flex-wrap gap-2">
                    {SUGAR_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${sugarLevel === option.value
                            ? "border-amber-800 bg-amber-50"
                            : "border-stone-300 hover:border-amber-700"
                          }`}
                      >
                        <input
                          type="radio"
                          name="sugarLevel"
                          value={option.value}
                          checked={sugarLevel === option.value}
                          onChange={() => setSugarLevel(option.value)}
                          className="accent-amber-800"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Mức đá */}
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-stone-800">
                    Mức đá
                  </legend>

                  <div className="flex flex-wrap gap-2">
                    {ICE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${iceLevel === option.value
                            ? "border-amber-800 bg-amber-50"
                            : "border-stone-300 hover:border-amber-700"
                          }`}
                      >
                        <input
                          type="radio"
                          name="iceLevel"
                          value={option.value}
                          checked={iceLevel === option.value}
                          onChange={() => setIceLevel(option.value)}
                          className="accent-amber-800"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Topping */}
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-stone-800">
                    Topping (có thể chọn nhiều)
                  </legend>

                  <div className="space-y-2">
                    {TOPPING_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-amber-700"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={toppings.includes(option.value)}
                            onChange={(event) =>
                              setToppings((current) =>
                                event.target.checked
                                  ? [...current, option.value]
                                  : current.filter(
                                    (value) => value !== option.value
                                  )
                              )
                            }
                            className="accent-amber-800"
                          />
                          {option.label}
                        </span>

                        <span className="shrink-0 text-stone-600">
                          +{formatCurrency(option.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              )}

              {/* Thông tin sản phẩm: nằm ngay dưới topping */}
              <div className="grid grid-cols-1 gap-3 border-b border-stone-200 py-5 text-sm sm:grid-cols-2">
                {product.quantity != null && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-stone-800">
                      Số lượng:
                    </span>
                    <span
                      className={
                        stock > 0 ? "text-emerald-700" : "text-red-600"
                      }
                    >
                      {stock} {product.unit || ""}
                    </span>
                  </div>
                )}

                {product.unit && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-stone-800">
                      Đơn vị:
                    </span>
                    <span>{product.unit}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <span className="font-semibold text-stone-800">
                    Mã sản phẩm:
                  </span>
                  <span>{product.id}</span>
                </div>
              </div>

              {/* Khu vực đặt hàng: nằm dưới toàn bộ thông tin */}
              <div className="pt-5">

                {stock > 0 ? (
                  <>
                    {/* Chọn số lượng */}
                    <div className="mb-5 flex items-center gap-3">
                      <span className="text-sm font-semibold text-stone-800">
                        Số lượng mua:
                      </span>

                      <div className="flex items-center overflow-hidden rounded-lg border border-stone-300">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className="h-10 w-10 transition hover:bg-stone-100 disabled:opacity-40"
                        >
                          -
                        </button>

                        <span className="flex h-10 w-12 items-center justify-center border-x border-stone-300">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= stock}
                          className="h-10 w-10 transition hover:bg-stone-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Nút mua hàng */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="rounded-lg border border-amber-800 px-5 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-50"
                      >
                        Thêm vào giỏ
                      </button>

                      <button
                        type="button"
                        onClick={handleBuyNow}
                        className="rounded-lg bg-amber-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-900"
                      >
                        Mua ngay
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="font-medium text-red-600">
                    Sản phẩm hiện đã hết hàng.
                  </p>
                )}

                {/* Thông báo giỏ hàng */}
                {cartMessage && (
                  <p
                    className="mt-4 text-sm font-medium text-amber-900"
                    role="status"
                  >
                    {cartMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mô tả chi tiết */}
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

          {/* Sản phẩm liên quan */}
          {related.length > 0 && (
            <div className="mt-16 border-t border-stone-200 pt-10">
              <h2 className="mb-8 text-center text-2xl font-bold text-stone-800">
                Sản phẩm liên quan
              </h2>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
