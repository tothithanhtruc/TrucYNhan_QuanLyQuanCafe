import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Shop Pages
import HomePage from "./pages/(shop)/HomePage";
import ShopProductsPage from "./pages/(shop)/ShopProductsPage";
import ProductDetailPage from "./pages/(shop)/ProductDetailPage";
import BlogPage from "./pages/(shop)/BlogPage";
import BlogDetailPage from "./pages/(shop)/BlogDetailPage";
import AboutPage from "./pages/(shop)/AboutPage";
import ContactPage from "./pages/(shop)/ContactPage";
import LoginPage from "./pages/(shop)/LoginPage";
import RegisterPage from "./pages/(shop)/RegisterPage";
import ContactInboxPage from "./pages/(shop)/ContactInboxPage";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminTablesPage from "./pages/admin/AdminTablesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminContactsPage from "./pages/admin/AdminContactsPage";
import AdminTrashPage from "./pages/admin/AdminTrashPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ */}
        <Route path="/" element={<HomePage />} />

        {/* Cửa hàng & Chi tiết sản phẩm - Hỗ trợ cả /shop và /products */}
        <Route path="/shop" element={<ShopProductsPage />} />
        <Route path="/shop/:id" element={<ProductDetailPage />} />
        <Route path="/products" element={<ShopProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Bài viết & Tin tức */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />

        {/* Giới thiệu & Liên hệ */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/inbox" element={<ContactInboxPage />} />

        {/* Quản trị (Admin) */}

        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/products"
          element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/categories"
          element={<ProtectedRoute adminOnly><AdminCategoriesPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/orders"
          element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/tables"
          element={<ProtectedRoute adminOnly><AdminTablesPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/trash"
          element={<ProtectedRoute adminOnly><AdminTrashPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/posts"
          element={<ProtectedRoute adminOnly><AdminPostsPage /></ProtectedRoute>}
        />

        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/tables" element={<AdminTablesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />



        <Route path="/admin/contacts" element={<AdminContactsPage />} />
        <Route path="/admin/trash" element={<AdminTrashPage />} />
        <Route path="/admin/posts" element={<AdminPostsPage />} />


        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
