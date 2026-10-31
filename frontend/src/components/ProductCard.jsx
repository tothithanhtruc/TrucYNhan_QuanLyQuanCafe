import { Link } from "react-router-dom";
import { formatCurrency, resolveProductImage } from "../utils/format";

/**
 * ProductCard – Card hiển thị sản phẩm theo phong cách Bickrost Coffee
 * Props: product: { id, name, category, price, originalPrice, rating, badge, image }
 */
export default function ProductCard({ product }) {
  const {
    id = 0,
    name = "Sản phẩm",
    category = "Coffee",
    price = 0,
    originalPrice,
    rating = 5,
    badge,
    image,
  } = product || {};

  // Xử lý an toàn: category có thể là String hoặc Object { id, name, ... } từ Spring Boot
  const categoryName =
    typeof category === "object" && category !== null
      ? category.name || "Coffee"
      : category || "Coffee";

  const imageUrl = resolveProductImage(image, id);

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? "text-amber-500" : "text-stone-300"}>★</span>
  ));

  const badgeColor =
    badge === "sale" || badge === "hot" ? "bg-amber-700" :
    badge === "new"  ? "bg-stone-800" :
    badge === "best" ? "bg-amber-900" : "bg-amber-800";

  const badgeLabel =
    badge === "sale" ? "Save 15%" :
    badge === "hot"  ? "Hot" :
    badge === "new"  ? "New" :
    badge === "best" ? "Best Seller" : badge;

  return (
    <Link
      to={`/products/${id}`}
      className="bg-white rounded-lg overflow-hidden border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
    >
       <div className="relative bg-[#f8f6f2] h-60 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = resolveProductImage(null, id);
          }}
        />
        {badgeLabel && (
          <span className={`absolute top-3 left-3 ${badgeColor} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm`}>
            {badgeLabel}
          </span>
        )}
      </div>


      {/* Body container */}
      <div className="p-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-center text-xs mb-1.5">{stars}</div>
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1 truncate">
            {categoryName}
          </p>
          <h3 className="font-heading font-medium text-stone-800 text-base leading-snug line-clamp-1 mb-2 group-hover:text-amber-800 transition-colors">
            {name}
          </h3>
        </div>
        <div className="flex items-center justify-center gap-2 mt-auto">
          <span className="text-stone-800 font-bold text-sm">
            {formatCurrency(price)}
          </span>
          {originalPrice && (
            <span className="text-stone-400 text-xs line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
