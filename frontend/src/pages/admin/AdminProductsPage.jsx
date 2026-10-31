import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Coffee,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminUploadImage,
} from "../../services/adminApi";
import { formatCurrency, resolveProductImage } from "../../utils/format";
import Pagination from "../../components/Pagination";
export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const initialFormState = {
    name: "",
    categoryId: "",
    price: "",
    salePrice: "",
    quantity: 100,
    unit: "Ly",
    image: "",
    tag: "",
    summary: "",
    detail: "",
    status: 1,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Tải sản phẩm và danh mục khi mở trang
  useEffect(() => {
    fetchData();
  }, []);

  // Khi tìm kiếm hoặc lọc danh mục thì quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        adminGetProducts(),
        adminGetCategories(),
      ]);

      if (prodRes.status === "fulfilled") {
        const prodData = prodRes.value.data?.data || prodRes.value.data || [];
        setProducts(sortNewestFirst(prodData));
      }
      if (catRes.status === "fulfilled") {
        const catData = catRes.value.data?.data || catRes.value.data || [];
        setCategories(catData);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
      showToast("Không thể tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  };

  const sortNewestFirst = (items) =>
    [...items].sort((a, b) => {
      const dateA = a.createdAt || a.created_at;
      const dateB = b.createdAt || b.created_at;
      const timeA = dateA ? new Date(dateA).getTime() : 0;
      const timeB = dateB ? new Date(dateB).getTime() : 0;
      return timeB - timeA || Number(b.id || 0) - Number(a.id || 0);
    });

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const response = await adminUploadImage(file);
      setFormData((current) => ({ ...current, image: response.data.url }));
      showToast("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Lỗi khi tải ảnh sản phẩm:", error);
      showToast(
        error.response?.data?.message || "Không thể tải ảnh lên",
        "error",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      categoryId: categories.length > 0 ? categories[0].id : "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      categoryId:
        product.categoryId || product.category?.id || (categories[0]?.id ?? ""),
      price: product.price || "",
      salePrice: product.salePrice || "",
      quantity: product.quantity ?? 100,
      unit: product.unit || "Ly",
      image: product.image || "",
      tag: product.tag || "",
      summary: product.summary || product.description || "",
      detail: product.detail || "",
      status: product.status ?? 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên món/sản phẩm");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError("Giá sản phẩm phải lớn hơn 0");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      name: formData.name.trim(),
      category: {
        id: Number(formData.categoryId),
      },
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      quantity: Number(formData.quantity) || 0,
      unit: formData.unit.trim() || "Ly",
      image: formData.image.trim(),
      tag: formData.tag.trim() || null,
      summary: formData.summary.trim(),
      detail: formData.detail.trim(),
      status: Number(formData.status),
    };

    try {
      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, payload);
        showToast("Cập nhật sản phẩm thành công!");
      } else {
        await adminCreateProduct(payload);
        showToast("Thêm mới sản phẩm thành công!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      const errMsg =
        err.response?.data?.message ||
        "Lỗi khi lưu thông tin sản phẩm. Vui lòng thử lại.";
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteProduct(id);
      showToast("Xóa sản phẩm thành công!");
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      showToast("Không thể xóa sản phẩm", "error");
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch = (p.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const productCatId = p.categoryId || p.category?.id;
    const matchCat =
      selectedCategory === "all" ||
      String(productCatId) === String(selectedCategory);
    return matchSearch && matchCat;
  });
  // Tổng số trang sau khi lọc
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Danh sách sản phẩm của trang hiện tại
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  return (
    <AdminLayout title="Quản Lý Sản Phẩm">
      <div className="space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-semibold transition-all ${
              notification.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {notification.type === "error" ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600" />
            )}
            {notification.message}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Danh Sách Món &amp; Sản Phẩm
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Quản lý menu cà phê, đồ uống, giá bán và số lượng trong kho.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              title="Làm mới danh sách"
              className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Thêm Món Mới
            </button>
            <Link
              to="/admin/trash"
              title="Mở thùng rác"
              className="p-2.5 text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo tên món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5" /> Danh mục:
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-52 py-2 px-3 text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition"
            >
              <option value="all">Tất cả danh mục ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-bold border-b border-stone-200/70">
                <tr>
                  <th className="py-3.5 px-4">Sản Phẩm</th>
                  <th className="py-3.5 px-4">Danh Mục</th>
                  <th className="py-3.5 px-4">Giá Bán</th>
                  <th className="py-3.5 px-4">Kho</th>
                  <th className="py-3.5 px-4">Nhãn (Tag)</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-stone-400"
                    >
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-amber-700" />
                        Đang tải danh sách sản phẩm...
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-stone-400"
                    >
                      Không tìm thấy món nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const catName =
                      p.category?.name ||
                      categories.find((c) => c.id === p.categoryId)?.name ||
                      "Cà phê";
                    const isSale =
                      p.salePrice && Number(p.salePrice) < Number(p.price);

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-stone-50/80 transition group"
                      >
                        {/* Image + Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center overflow-hidden shrink-0">
                              <img
                                src={resolveProductImage(p.image, p.id)}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.hidden = true;
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-800 hover:text-amber-800 transition truncate max-w-xs">
                                {p.name}
                              </p>
                              <p className="text-xs text-stone-400 truncate max-w-xs">
                                {p.summary || p.description || "Chưa có mô tả"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-stone-600 font-medium text-xs">
                          <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700">
                            {catName}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">
                            {formatCurrency(isSale ? p.salePrice : p.price)}
                          </div>
                          {isSale && (
                            <div className="text-xs text-stone-400 line-through">
                              {formatCurrency(p.price)}
                            </div>
                          )}
                        </td>

                        {/* Quantity & Unit */}
                        <td className="py-3 px-4 text-stone-700 font-medium text-xs">
                          {p.quantity ?? 100} {p.unit || "Ly"}
                        </td>

                        {/* Tag */}
                        <td className="py-3 px-4">
                          {p.tag ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                              {p.tag}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-300">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {p.status === 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                              Tạm ẩn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                              Đang bán
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="Sửa món"
                              className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              title="Xóa món"
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Phân trang */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        {/* Modal Thêm / Sửa Sản Phẩm */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <h3 className="text-lg font-bold text-stone-900">
                  {editingProduct
                    ? "Cập Nhật Món / Sản Phẩm"
                    : "Thêm Món Mới Vào Menu"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Tên Sản Phẩm *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Cà Phê Muối Kem Béo, Espresso Đậm Đà..."
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Danh Mục *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Đơn Vị Tính
                    </label>
                    <input
                      type="text"
                      placeholder="Ly, Chai, Gói, Bịch..."
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Giá Bán (VNĐ) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      placeholder="35000"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Giá Khuyến Mãi (Nếu có)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="29000 (Để trống nếu không giảm)"
                      value={formData.salePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, salePrice: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Số Lượng Kho
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Nhãn (Tag)
                    </label>
                    <select
                      value={formData.tag}
                      onChange={(e) =>
                        setFormData({ ...formData, tag: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    >
                      <option value="">Không có nhãn</option>
                      <option value="best">Best Seller</option>
                      <option value="hot">Hot</option>
                      <option value="new">Món Mới</option>
                      <option value="sale">Giảm Giá</option>
                    </select>
                  </div>

                  {/* Image URL with preview */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Hình Ảnh Sản Phẩm
                    </label>
                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                        {uploadingImage ? "Đang tải..." : "Chọn ảnh từ máy"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/gif,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Hoặc dán URL ảnh..."
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        className="flex-1 px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                      />
                      <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Mô Tả Ngắn
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả ngắn gọn về hương vị đặc trưng của món..."
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>

                  {/* Detail */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Chi Tiết Sản Phẩm (Thành phần, cách thưởng thức)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Hạt Robusta phối Arabica Cầu Đất rang mộc vừa, sữa đặc hảo hạng..."
                      value={formData.detail}
                      onChange={(e) =>
                        setFormData({ ...formData, detail: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    {submitting
                      ? "Đang lưu..."
                      : editingProduct
                        ? "Lưu Thay Đổi"
                        : "Thêm Món"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Xóa Sản Phẩm?
              </h3>
              <p className="text-xs text-stone-500 mt-2">
                Hành động này sẽ xóa sản phẩm khỏi thực đơn quán. Bạn có chắc
                chắn muốn xóa?
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
                >
                  Xác Nhận Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
