import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ShopProductsPage from "./pages/ShopProductsPage";
import ProductListPage from "./pages/ProductListPage"; // trang admin cũ

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang công khai */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/products" element={<ShopProductsPage />} />

        {/* Trang quản trị (giữ nguyên) */}
        <Route path="/admin/products" element={<ProductListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
