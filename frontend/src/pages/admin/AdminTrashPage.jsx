import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  adminGetDeletedProducts,
  adminGetDeletedCategories,
  adminGetDeletedOrders,
  adminRestoreProduct,
  adminRestoreCategory,
  adminRestoreOrder,
  adminPermanentlyDeleteProduct,
  adminPermanentlyDeleteCategory,
  adminPermanentlyDeleteOrder,
} from "../../services/adminApi";

const tabs = [
  { id: "products", label: "Sản phẩm" },
  { id: "categories", label: "Danh mục" },
  { id: "orders", label: "Đơn hàng" },
];

export default function AdminTrashPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadTrash = async () => {
    setLoading(true);
    try {
      const loaders = {
        products: adminGetDeletedProducts,
        categories: adminGetDeletedCategories,
        orders: adminGetDeletedOrders,
      };
      const response = await loaders[activeTab]();
      setItems(response.data?.data || []);
    } catch (error) {
      console.error("Lỗi khi tải thùng rác:", error);
      setMessage("Không thể tải dữ liệu thùng rác.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, [activeTab]);

  const handleAction = async (item, action) => {
    const actions = {
      products: {
        restore: adminRestoreProduct,
        permanent: adminPermanentlyDeleteProduct,
      },
      categories: {
        restore: adminRestoreCategory,
        permanent: adminPermanentlyDeleteCategory,
      },
      orders: {
        restore: adminRestoreOrder,
        permanent: adminPermanentlyDeleteOrder,
      },
    };

    if (action === "permanent" && !window.confirm("Xóa vĩnh viễn mục này? Không thể khôi phục.")) {
      return;
    }

    try {
      await actions[activeTab][action](item.id);
      setMessage(action === "restore" ? "Đã khôi phục thành công." : "Đã xóa vĩnh viễn.");
      loadTrash();
    } catch (error) {
      console.error("Lỗi thao tác thùng rác:", error);
      setMessage("Thao tác thất bại. Vui lòng thử lại.");
    }
  };

  const getLabel = (item) => {
    if (activeTab === "orders") return `Đơn #${item.orderCode || item.id}`;
    return item.name || `Mục #${item.id}`;
  };

  return (
    <AdminLayout title="Thùng Rác">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Thùng Rác</h1>
            <p className="text-sm text-stone-500 mt-1">
              Khôi phục hoặc xóa vĩnh viễn các mục đã xóa.
            </p>
          </div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại quản lý
          </Link>
        </div>

        <div className="flex gap-2 border-b border-stone-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? "text-amber-800 border-amber-700"
                  : "text-stone-500 border-transparent hover:text-stone-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message && <p className="text-sm text-stone-600">{message}</p>}

        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-stone-400">Đang tải thùng rác...</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-stone-400">Thùng rác đang trống.</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold text-stone-800">{getLabel(item)}</p>
                    {activeTab === "orders" && (
                      <p className="text-xs text-stone-500 mt-1">{item.customerName || (item.note?.match(/Tên:\s*([^|]+)/i)?.[1]?.trim()) || item.username || "Khách tại quầy"}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(item, "restore")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                    </button>
                    <button
                      onClick={() => handleAction(item, "permanent")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
