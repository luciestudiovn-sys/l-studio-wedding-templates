import React from 'react';
import { Sparkles, Check, Smartphone, Music, QrCode } from 'lucide-react';

interface HeroSectionProps {
  totalCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ totalCount }) => {
  return (
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-neutral-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-neutral-400 mb-4 tracking-wide uppercase">
          <a href="#" className="hover:text-neutral-700 transition-colors">Trang chủ</a>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="text-neutral-800 font-semibold">Mẫu thiệp L-Studio</span>
        </nav>

        {/* Hero Content */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-neutral-200/60">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Toàn bộ {totalCount} mẫu thiệp đã mở khóa &bull; Miễn phí sử dụng</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight font-serif leading-tight mb-4">
            Mẫu thiệp cưới online tinh tế &amp; tối giản
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed mb-8 max-w-2xl">
            Bộ sưu tập thiệp điện tử phong cách tối giản từ <strong>L-Studio</strong>.
            Tất cả mẫu thiệp đều sẵn sàng sử dụng: xem trước trực tiếp trên điện thoại, phát nhạc nền lãng mạn và tạo liên kết gửi khách mời chỉ trong vài phút.
          </p>

          {/* Minimalist Feature Tags */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-medium text-neutral-600">
            <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/80">
              <Check className="w-3.5 h-3.5 text-neutral-900" />
              <span>Đã mở khóa 100%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/80">
              <Smartphone className="w-3.5 h-3.5 text-neutral-900" />
              <span>Chuẩn mọi dòng điện thoại</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/80">
              <Music className="w-3.5 h-3.5 text-neutral-900" />
              <span>Nhạc nền đám cưới MP3</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/80">
              <QrCode className="w-3.5 h-3.5 text-neutral-900" />
              <span>Quét mã QR xem tức thì</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
