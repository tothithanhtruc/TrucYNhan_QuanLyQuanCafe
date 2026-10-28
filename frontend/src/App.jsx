import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ShopProductsPage from "./pages/ShopProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProductListPage from "./pages/ProductListPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ */}
        <Route path="/" element={<HomePage />} />

        {/* Cửa hàng & Chi tiết sản phẩm */}
        <Route path="/products" element={<ShopProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Bài viết & Tin tức */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />

        {/* Giới thiệu & Liên hệ */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Quản trị (Admin) */}
        <Route path="/admin/products" element={<ProductListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
