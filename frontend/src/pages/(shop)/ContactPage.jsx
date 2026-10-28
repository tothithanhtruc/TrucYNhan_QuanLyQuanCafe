import { useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { sendContact } from "../../services/contactApi";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Chuẩn bị payload chuẩn khớp DTO ContactRequest backend
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      subject: (formData.subject.trim() || "Khách hàng liên hệ từ Website"),
      message: formData.message.trim(),
      status: 1,
    };

    try {
      const res = await sendContact(payload);
      if (res.status === 200 || res.status === 201) {
        setSuccess("Cảm ơn bạn! Thông tin liên hệ đã được lưu thành công vào hệ thống. Chúng tôi sẽ sớm liên hệ lại.");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setError("Không thể lưu thông tin liên hệ. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi gửi liên hệ:", err);
      const serverMessage = err.response?.data?.message || err.message;
      if (err.response?.status === 403) {
        setError("Hệ thống backend chưa cấp quyền gửi liên hệ (403 Forbidden). Hãy đảm bảo Backend đã được khởi động lại sau khi cập nhật SecurityConfig.");
      } else if (err.response?.status === 400) {
        setError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại email hoặc các trường bắt buộc.");
      } else {
        setError("Lỗi gửi liên hệ: " + (serverMessage || "Không kết nối được tới máy chủ"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* ═══════════ BREADCRUMB ═══════════ */}
      <div className="bg-[#f7f5f2] border-b border-stone-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <Link to="/" className="hover:text-amber-800 transition-colors">Home</Link>
          <span className="mx-2 text-stone-400">/</span>
          <span className="text-stone-800">Liên hệ</span>
        </div>
      </div>

      {/* ═══════════ HEADER ═══════════ */}
      <section className="bg-[#faf8f5] py-14 border-b border-stone-200 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-[3px] text-amber-800 block mb-2">
            Get in touch
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Bạn có thắc mắc về sản phẩm, dịch vụ hoặc mong muốn hợp tác đại lý? Hãy để lại thông tin, chúng tôi luôn sẵn sàng lắng nghe và giải đáp tận tình.
          </p>
        </div>
      </section>

      {/* ═══════════ CONTACT FORM & INFO ═══════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left: Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-heading text-2xl font-bold text-stone-900 mb-4">
                  Cửa Hàng Bickrost Coffee
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  Ghé thăm không gian cà phê mộc ấm cúng của chúng tôi để thưởng thức hương vị tươi mới mỗi ngày.
                </p>
              </div>

              <div className="space-y-6 text-sm text-stone-600">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 text-lg flex-shrink-0 border border-amber-100">
                    📍
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">Địa chỉ cửa hàng</h4>
                    <p>123 Đường Cà Phê, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 text-lg flex-shrink-0 border border-amber-100">
                    📞
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">Hotline tư vấn &amp; đặt hàng</h4>
                    <p>0900 000 000 - (028) 3822 0000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 text-lg flex-shrink-0 border border-amber-100">
                    ✉️
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">Email hỗ trợ</h4>
                    <p>hello@bickrost.vn - support@bickrost.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 text-lg flex-shrink-0 border border-amber-100">
                    ⏰
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">Giờ mở cửa</h4>
                    <p>Thứ 2 - Chủ Nhật: 07:00 - 22:30 (Cả ngày lễ)</p>
                  </div>
                </div>
              </div>

              {/* Map embed / mockup */}
              <div className="rounded-xl overflow-hidden border border-stone-200 h-64 bg-stone-100 relative">
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.494668100784!2d106.69916291474889!3d10.773374292323533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f47285a86eb%3A0x82db0e271eb5ee44!2zQuG6v24gVGjDoG5oLCBRdeG6rW4gMSwgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-[#faf8f5] p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-heading text-2xl font-bold text-stone-900 mb-2">
                Gửi Tin Nhắn Cho Bickrost
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mb-6">
                Vui lòng điền thông tin bên dưới, thông tin sẽ được lưu trực tiếp vào hệ thống để bộ phận CSKH liên hệ với bạn.
              </p>

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                  <span>✓</span> {success}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      maxLength={100}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={20}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0901234567"
                      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    name="subject"
                    maxLength={200}
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Hỏi về sản phẩm cà phê hạt / Đặt hàng số lượng lớn"
                    className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    name="message"
                    required
                    maxLength={250}
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Chia sẻ yêu cầu hoặc nội dung câu hỏi của bạn..."
                    className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-800 resize-none"
                  ></textarea>
                  <div className="text-[11px] text-stone-400 text-right mt-1">
                    {formData.message.length}/250 ký tự
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang gửi đến hệ thống...</span>
                    </>
                  ) : (
                    <span>Gửi tin nhắn ngay</span>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
