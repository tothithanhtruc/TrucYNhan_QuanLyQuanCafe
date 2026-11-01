import { ShieldCheck, LockKeyhole, UserRound, CreditCard, Database, Mail } from "lucide-react";

const securityItems = [
  {
    icon: UserRound,
    category: "QUYỀN RIÊNG TƯ",
    title: "Bảo vệ thông tin cá nhân",
    content:
      "Chúng tôi tôn trọng quyền riêng tư của khách hàng. Thông tin cá nhân chỉ được sử dụng để hỗ trợ mua sắm, xử lý đơn hàng và cải thiện chất lượng dịch vụ."
  },
  {
    icon: LockKeyhole,
    category: "TÀI KHOẢN",
    title: "Bảo mật tài khoản",
    content:
      "Khách hàng nên sử dụng mật khẩu có độ an toàn cao, không chia sẻ mật khẩu hoặc mã xác thực cho người khác và đăng xuất khi sử dụng thiết bị công cộng."
  },
  {
    icon: CreditCard,
    category: "GIAO DỊCH",
    title: "Thanh toán an toàn",
    content:
      "Khách hàng cần kiểm tra kỹ thông tin đơn hàng và phương thức thanh toán trước khi xác nhận. Không cung cấp thông tin thanh toán cho những nguồn không đáng tin cậy."
  },
  {
    icon: Database,
    category: "LƯU TRỮ",
    title: "Quản lý dữ liệu",
    content:
      "Thông tin khách hàng cần được quản lý phù hợp với mục đích sử dụng, hạn chế truy cập trái phép và chỉ được chia sẻ khi có căn cứ phù hợp."
  },
  {
    icon: Mail,
    category: "HỖ TRỢ",
    title: "Hỗ trợ bảo mật",
    content:
      "Nếu phát hiện dấu hiệu bất thường liên quan đến tài khoản hoặc thông tin cá nhân, khách hàng có thể liên hệ với bộ phận hỗ trợ để được hướng dẫn."
  }
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#fbf9f5] font-sans py-12 text-[#2c2724]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#8c7462]">
            AN TOÀN VÀ TIN CẬY
          </p>

          <h1 className="font-serif text-3xl font-normal tracking-wide text-[#1c1917] sm:text-4xl">
            Chính sách bảo mật
          </h1>

          <div className="mx-auto mt-4 h-[2px] w-12 bg-[#c5a059]"></div>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#6b625b]">
            Bickrost cam kết bảo vệ an toàn cho tài khoản và thông tin cá nhân của bạn trong quá trình thưởng thức và trải nghiệm dịch vụ của chúng tôi.
          </p>
        </div>

        {/*  Giới thiệu */}
        <section className="mb-8 border border-[#e6dfd5] bg-white p-6 shadow-sm sm:p-8 rounded-none">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#c85a17] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              BICKROST POLICY
            </span>
            <h2 className="text-lg font-medium text-[#1c1917]">
              1. Giới thiệu
            </h2>
          </div>
          
          <p className="text-sm leading-7 text-[#5c544d]">
            Chính sách này giải thích cách website <strong className="text-[#1c1917] font-semibold">Bickrost</strong> tiếp nhận, sử dụng và bảo vệ thông tin của khách hàng. Khi sử dụng website, khách hàng nên đọc kỹ các nội dung dưới đây để hiểu rõ quyền lợi và trách nhiệm của mình.
          </p>
        </section>

        {/* Security Items Grid - Khung Vuông chuẩn màu Bickrost */}
        <section className="grid gap-6 md:grid-cols-2">
          {securityItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative flex flex-col justify-between border border-[#e8e2d9] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#c5a059] hover:shadow-md rounded-none"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center border border-[#e8e2d9] bg-[#fdfbf7] text-[#8c7462] transition-colors group-hover:bg-[#332d29] group-hover:text-[#c5a059]">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#b5a89e]">
                      0{index + 2} // {item.category}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#1c1917] group-hover:text-[#c85a17] transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#6b625b]">
                    {item.content}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-8 border border-[#2c2724] bg-[#221e1b] p-6 text-white shadow-md sm:p-8 rounded-none">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={20} className="text-[#c5a059]" />
                <h2 className="font-serif text-lg font-medium tracking-wide text-[#f5ebd9]">
                  Cam kết từ Bickrost
                </h2>
              </div>
              <p className="max-w-3xl text-xs leading-6 text-[#d2c7b8]">
                Chúng tôi hướng đến việc xây dựng môi trường mua sắm an toàn, minh bạch và đáng tin cậy. Chính sách sẽ được cập nhật thường xuyên nhằm đảm bảo quyền lợi tối đa cho quý khách hàng.
              </p>
            </div>
            
            <a 
              href="/contact" 
              className="whitespace-nowrap border border-[#c5a059] bg-[#c5a059] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1c1917] transition hover:bg-transparent hover:text-[#c5a059]"
            >
              Liên hệ hỗ trợ
            </a>
          </div>
        </section>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs tracking-wider text-[#9e9389]">
          Nếu cần trợ giúp thêm, vui lòng liên hệ trực tiếp qua trang <a href="/contact" className="underline hover:text-[#c85a17]">Liên hệ Bickrost</a>.
        </p>
      </div>
    </main>
  );
}