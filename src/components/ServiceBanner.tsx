import React from 'react';
import { Sparkles, Clock, Palette, Headphones, ArrowRight } from 'lucide-react';

interface ServiceBannerProps {
  onOpenConsult?: () => void;
}

export const ServiceBanner: React.FC<ServiceBannerProps> = ({ onOpenConsult }) => {
  return (
    <section id="dich-vu" className="mt-14 mb-10 bg-neutral-900 rounded-2xl p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden border border-neutral-800 shadow-sm">
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Dịch vụ thiết kế thiệp trọn gói &bull; L-Studio
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight text-white mb-3">
            Thiết kế thiệp cưới độc bản cùng L-Studio
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Nếu bạn muốn một trang thiệp cưới điện tử được thiết kế riêng theo concept tiệc, chỉnh sửa ảnh cưới chuyên nghiệp và hỗ trợ xuất bản link riêng, đội ngũ L-Studio luôn sẵn sàng đồng hành.
          </p>
        </div>

        {/* 4 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-neutral-800/60 rounded-xl p-5 border border-neutral-700/60">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 text-white flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Hoàn thiện 100%</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Từ bố cục, hiệu ứng đến âm nhạc. Bạn chỉ cần gửi ảnh và thông tin hôn lễ.
            </p>
          </div>

          <div className="bg-neutral-800/60 rounded-xl p-5 border border-neutral-700/60">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 text-white flex items-center justify-center mb-3">
              <Clock className="w-4 h-4 text-neutral-200" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Thời gian nhanh</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Bàn giao trong 1-2 ngày làm việc. Đúng tiến độ để gửi khách mời kịp thời.
            </p>
          </div>

          <div className="bg-neutral-800/60 rounded-xl p-5 border border-neutral-700/60">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 text-white flex items-center justify-center mb-3">
              <Palette className="w-4 h-4 text-neutral-200" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Thiết kế độc bản</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tùy chỉnh màu sắc, phông chữ và bố cục hài hòa với phong cách tiệc cưới của bạn.
            </p>
          </div>

          <div className="bg-neutral-800/60 rounded-xl p-5 border border-neutral-700/60">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 text-white flex items-center justify-center mb-3">
              <Headphones className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Hỗ trợ 24/7</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Đội ngũ thiết kế hỗ trợ trực tiếp và chỉnh sửa theo mong muốn của dâu rể.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onOpenConsult}
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-7 py-3 rounded-full shadow-sm transition-all text-xs sm:text-sm"
          >
            <span>Tư vấn làm thiệp cưới riêng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
