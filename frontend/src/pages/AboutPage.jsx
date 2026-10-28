import { Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";

export default function AboutPage() {
  const stats = [
    { icon: "▦", number: "10+", label: "Năm kinh nghiệm rang mộc" },
    { icon: "◉", number: "100%", label: "Hạt cà phê nguyên chất" },
    { icon: "♧", number: "25+", label: "Vùng trồng liên kết" },
    { icon: "☕", number: "50.000+", label: "Tách cà phê mỗi tháng" },
  ];

  const values = [
    {
      number: "01",
      icon: "🌱",
      title: "Canh tác bền vững",
      desc: "Hợp tác cùng các nông hộ tại Cầu Đất và Buôn Ma Thuột, hướng đến nguồn nguyên liệu chất lượng và thân thiện với môi trường.",
      image:
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=85",
    },
    {
      number: "02",
      icon: "🔥",
      title: "Rang mộc thủ công",
      desc: "Từng mẻ cà phê được kiểm soát cẩn thận để lưu giữ hương thơm tự nhiên và tạo nên dấu ấn riêng trong từng tách.",
      image:
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=85",
    },
    {
      number: "03",
      icon: "☕",
      title: "Trải nghiệm trọn vẹn",
      desc: "Mang đến không gian thư thái, những thức uống chỉn chu và nguồn cảm hứng cho từng khoảnh khắc trong ngày.",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Tuyển chọn hạt",
      desc: "Ưu tiên nguyên liệu chất lượng, chọn lọc kỹ lưỡng từ những vùng trồng cà phê.",
    },
    {
      number: "02",
      title: "Sơ chế cẩn thận",
      desc: "Kiểm soát quá trình sơ chế để giữ gìn đặc tính hương vị tự nhiên của hạt.",
    },
    {
      number: "03",
      title: "Rang chuẩn vị",
      desc: "Điều chỉnh nhiệt độ và thời gian rang phù hợp để tạo nên hương thơm đặc trưng.",
    },
  ];

  return (
    <PublicLayout>
      <main className="overflow-hidden bg-[#faf7f1] text-[#382316]">
        {/* BREADCRUMB */}
        <div className="border-b border-[#e8dfd3] bg-[#f5efe5]">
          <div className="mx-auto max-w-7xl px-5 py-4 text-xs text-[#806b59]">
            <Link to="/" className="transition hover:text-[#a65d2e]">
              Trang chủ
            </Link>
            <span className="mx-3">/</span>
            <span className="font-semibold text-[#493021]">Giới thiệu</span>
          </div>
        </div>

        {/* HERO */}
        <section className="relative">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
            <div className="relative z-10">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-[#a65d2e]" />
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#a65d2e]">
                  Câu chuyện của Bickrost
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold leading-[1.15] tracking-tight text-[#382316] sm:text-5xl xl:text-6xl">
                Đánh thức
                <span className="mt-1 block text-[#a65d2e]">
                  hương vị cà phê
                </span>
                <span className="block">Việt Nam</span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-7 text-[#76685c] sm:text-base">
                Bickrost bắt đầu từ tình yêu dành cho những hạt cà phê Việt
                Nam. Chúng tôi mong muốn gìn giữ nét văn hóa cà phê truyền
                thống, kết hợp cùng kỹ thuật rang xay hiện đại để tạo nên
                những trải nghiệm đáng nhớ.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#76685c] sm:text-base">
                Từ vùng nguyên liệu đến tách cà phê trên tay bạn, mỗi công
                đoạn đều là sự kết hợp giữa tâm huyết, sự tỉ mỉ và niềm đam
                mê với hương vị nguyên bản.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#7b4023] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#7b4023]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#a65d2e]"
                >
                  Khám phá sản phẩm
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <span className="text-xs italic text-[#887666]">
                  Crafted with passion, served with love.
                </span>
              </div>

              <div className="mt-10 flex items-center gap-4 border-t border-[#e6dbce] pt-6">
                <div className="flex -space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=100&q=80"
                    alt="Vùng nguyên liệu"
                    className="h-10 w-10 rounded-full border-2 border-[#faf7f1] object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=100&q=80"
                    alt="Hạt cà phê"
                    className="h-10 w-10 rounded-full border-2 border-[#faf7f1] object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&q=80"
                    alt="Tách cà phê"
                    className="h-10 w-10 rounded-full border-2 border-[#faf7f1] object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#493021]">
                    Từ nông trại đến tách cà phê
                  </p>
                  <p className="mt-1 text-xs text-[#887666]">
                    Chỉn chu trong từng công đoạn
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border border-[#c9a47c]/60 sm:-right-6 sm:-top-6 sm:h-44 sm:w-44" />
              <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-[#e9d8c0] sm:h-44 sm:w-44" />

              <div className="relative z-10 overflow-hidden rounded-[2rem] shadow-2xl shadow-[#4a2b18]/20">
                <img
                  src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=90"
                  alt="Hạt cà phê rang thơm của Bickrost"
                  className="h-[360px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[480px] lg:h-[550px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211309]/75 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#e9c69c]">
                    The art of coffee
                  </p>
                  <p className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
                    Hương vị từ tâm huyết
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Mộc mạc · Tinh tế · Đậm đà
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-7 right-4 z-20 rounded-2xl border border-[#e7d6c1] bg-white/95 p-4 shadow-xl backdrop-blur sm:right-7 sm:p-5">
                <p className="font-heading text-2xl font-bold text-[#8d4d29]">
                  Bickrost
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8b7968]">
                  Coffee &amp; more
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="relative border-y border-[#e9dfd2] bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-8 sm:py-10 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`group px-3 py-5 text-center transition hover:bg-[#faf5ed] sm:px-6 ${
                  index < 3 ? "lg:border-r lg:border-[#e8dfd3]" : ""
                } ${index % 2 === 0 ? "border-r border-[#e8dfd3] lg:border-r" : ""} ${
                  index < 2 ? "border-b border-[#e8dfd3] lg:border-b-0" : ""
                }`}
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6ecdf] text-2xl text-[#8d4d29] transition duration-300 group-hover:-translate-y-1 group-hover:bg-[#7b4023] group-hover:text-white">
                  {stat.icon}
                </span>
                <p className="mt-4 font-heading text-3xl font-bold text-[#7b4023] sm:text-4xl">
                  {stat.number}
                </p>
                <p className="mx-auto mt-2 max-w-[190px] text-[10px] font-semibold uppercase leading-5 tracking-[0.12em] text-[#817062] sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="relative py-16 sm:py-24">
          <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-[#ead9c2]/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#e6d2b8]/40 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5">
            <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[#a65d2e]" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#a65d2e]">
                  Điều làm nên Bickrost
                </span>
                <span className="h-px w-8 bg-[#a65d2e]" />
              </div>

              <h2 className="font-heading text-3xl font-bold leading-tight text-[#382316] sm:text-4xl lg:text-5xl">
                Tâm huyết trong
                <span className="text-[#a65d2e]"> từng chi tiết</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#817062] sm:text-base">
                Giá trị của chúng tôi được tạo nên từ sự trân trọng nguyên
                liệu, sự tận tâm trong chế biến và trải nghiệm dành cho mỗi
                khách hàng.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {values.map((value) => (
                <article
                  key={value.number}
                  className="group overflow-hidden rounded-3xl border border-[#e9dfd2] bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#5b371e]/10"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={value.image}
                      alt={value.title}
                      loading="lazy"
                      className="h-56 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-64"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#29180d]/70 via-transparent to-transparent" />

                    <span className="absolute left-5 top-5 rounded-full border border-white/40 bg-black/20 px-4 py-2 text-xs font-bold tracking-widest text-white backdrop-blur">
                      {value.number}
                    </span>

                    <span className="absolute -bottom-1 left-6 flex h-14 w-14 translate-y-1/2 items-center justify-center rounded-2xl border-4 border-white bg-[#7b4023] text-2xl shadow-lg">
                      {value.icon}
                    </span>
                  </div>

                  <div className="p-6 pt-10 sm:p-7 sm:pt-11">
                    <h3 className="font-heading text-xl font-bold text-[#382316] transition group-hover:text-[#a65d2e] sm:text-2xl">
                      {value.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#817062]">
                      {value.desc}
                    </p>
                    <div className="mt-6 h-1 w-12 rounded-full bg-[#c59a6b] transition-all duration-300 group-hover:w-24" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* COFFEE PROCESS */}
        <section className="border-y border-[#e9dfd2] bg-white py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <div className="grid grid-cols-2 items-start gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=700&q=85"
                    alt="Vùng trồng cà phê"
                    loading="lazy"
                    className="h-48 w-full rounded-2xl object-cover shadow-lg sm:h-60"
                  />
                  <div className="rounded-2xl bg-[#f4e9da] p-5 sm:p-6">
                    <p className="font-heading text-3xl font-bold text-[#7b4023]">
                      From
                    </p>
                    <p className="mt-1 text-sm text-[#76685c]">Farm</p>
                  </div>
                </div>

                <div className="space-y-4 pt-10 sm:pt-14">
                  <div className="rounded-2xl bg-[#7b4023] p-5 text-white sm:p-6">
                    <p className="font-heading text-3xl font-bold">To</p>
                    <p className="mt-1 text-sm text-white/75">Cup</p>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&q=85"
                    alt="Tách cà phê được pha chế"
                    loading="lazy"
                    className="h-56 w-full rounded-2xl object-cover shadow-lg sm:h-72"
                  />
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-5 -left-3 h-20 w-20 rounded-full border border-[#c59a6b]/70 sm:-left-6 sm:h-28 sm:w-28" />
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-10 bg-[#a65d2e]" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#a65d2e]">
                  Quy trình của chúng tôi
                </span>
              </div>

              <h2 className="font-heading text-3xl font-bold leading-tight text-[#382316] sm:text-4xl lg:text-5xl">
                Từ nông trại xanh
                <span className="mt-1 block text-[#a65d2e]">
                  đến tách cà phê
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#817062] sm:text-base">
                Chúng tôi tin rằng một tách cà phê ngon bắt đầu từ những điều
                nhỏ nhất. Mỗi bước đều được chú trọng để đem đến hương vị
                hài hòa và trải nghiệm đáng nhớ.
              </p>

              <div className="mt-8 space-y-6">
                {process.map((item, index) => (
                  <div key={item.number} className="group flex gap-4 sm:gap-5">
                    <div className="flex shrink-0 flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1e4d4] font-heading text-sm font-bold text-[#7b4023] transition group-hover:bg-[#7b4023] group-hover:text-white">
                        {item.number}
                      </span>
                      {index !== process.length - 1 && (
                        <span className="mt-2 min-h-8 w-px flex-1 bg-[#e6d6c3]" />
                      )}
                    </div>

                    <div className="pb-2">
                      <h3 className="font-heading text-lg font-bold text-[#382316] sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#817062]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/products"
                className="mt-7 inline-flex items-center gap-3 border-b border-[#a65d2e] pb-2 text-sm font-bold text-[#7b4023] transition hover:gap-5 hover:text-[#a65d2e]"
              >
                Khám phá hương vị Bickrost
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative isolate overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1800&q=90"
            alt="Không gian cà phê Bickrost"
            loading="lazy"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[#24150c]/80" />

          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:py-20 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e8bd8f]">
                Bickrost · Coffee &amp; more
              </p>
              <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Một tách cà phê,
                <span className="block text-[#e8bd8f]">
                  một khoảnh khắc đáng nhớ.
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                Ghé thăm thế giới cà phê Bickrost và tìm ra hương vị phù hợp
                với riêng bạn.
              </p>
            </div>

            <Link
              to="/products"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-white/50 px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:border-[#e8bd8f] hover:bg-[#e8bd8f] hover:text-[#382316]"
            >
              Khám phá ngay
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}