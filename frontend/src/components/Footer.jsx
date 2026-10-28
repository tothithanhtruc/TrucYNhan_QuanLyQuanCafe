import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <span className="font-heading italic text-2xl font-bold text-white block">
              Bickrost
            </span>
            <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
              Thưởng thức hương vị cà phê đích thực từ các vùng trồng cà phê nổi tiếng thế giới. Chúng tôi cam kết mang đến những hạt cà phê rang mộc chuẩn vị nhất.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">
              Cửa hàng
            </h4>
            <ul className="space-y-2.5 text-xs text-amber-200/80">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Tất cả sản phẩm</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Cà phê truyền thống</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Cà phê pha máy</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Dụng cụ pha chế</Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">
              Thông tin &amp; Khám phá
            </h4>
            <ul className="space-y-2.5 text-xs text-amber-200/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Về Bickrost</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">Góc cà phê &amp; Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Liên hệ &amp; Hỗ trợ</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">
              Liên hệ
            </h4>
            <ul className="space-y-2.5 text-xs text-amber-200/80">
              <li>📍 123 Đường Cà Phê, Quận 1, TP.HCM</li>
              <li>📞 0900 000 000</li>
              <li>✉️ hello@bickrost.vn</li>
              <li>⏰ 07:00 - 22:30 hàng ngày</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-900/60 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-amber-300/60 gap-3">
          <span>© 2026 Bickrost Coffee. All rights reserved.</span>
          <span>Thiết kế &amp; Phát triển bởi TrucYNhan</span>
        </div>
      </div>
    </footer>
  );
}
