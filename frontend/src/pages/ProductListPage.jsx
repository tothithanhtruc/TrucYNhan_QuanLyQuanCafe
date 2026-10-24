// const [products, setProducts] = useState([]);
// const [loading, setLoading] = useState(true);
// useEffect(() => {
//  getProducts()
//  .then(res => setProducts(res.data))
//  .catch(() => setError(true))
//  .finally(() => setLoading(false));
// }, []);

import { useEffect, useState } from "react";
import { getProducts } from "../services/productApi";

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProducts()
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy sản phẩm:", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Đang tải danh sách sản phẩm...</p>;
  }

  if (error) {
    return (
      <p>Không thể tải sản phẩm. Hãy kiểm tra backend Spring Boot.</p>
    );
  }

  return (
    <div>
      <h1>Quản lý sản phẩm</h1>

      {products.length === 0 ? (
        <p>Chưa có sản phẩm nào.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductListPage;
