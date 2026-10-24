import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-amber-900 text-amber-100">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <span className="font-heading italic text-2xl font-bold text-white block mb-3">Bickrost</span>
            <p className="text-sm text-amber-200 leading-relaxed">
              Thưởng thức hương vị cà phê đích thực từ các vùng trồng cà phê
              nổi tiếng thế giới. Chúng tôi cam kết mang đến chất lượng cao nhất.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-amber-200">
              {["Tất cả sản phẩm", "Cà phê hạt", "Cà phê xay", "Máy pha cà phê", "Phụ kiện"].map((item) => (
                <li key={item}><Link to="/products" className="hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">Thông tin</h4>
            <ul className="space-y-2 text-sm text-amber-200">
              {["Về chúng tôi", "Blog", "Liên hệ", "Chính sách bảo mật", "Điều khoản"].map((item) => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-amber-200">
              <li>📍 123 Đường Cà Phê, TP.HCM</li>
              <li>📞 0900 000 000</li>
              <li>✉️ hello@bickrost.vn</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-700 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-amber-400 gap-2">
          <span>© 2026 Bickrost. All rights reserved.</span>
          <span>Thiết kế bởi TrucYNhan</span>
        </div>
      </div>
    </footer>
  );
}
