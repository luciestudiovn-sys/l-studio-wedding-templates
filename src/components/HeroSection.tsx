import React from 'react';
import { Eye } from 'lucide-react';
import { Template } from '../types/template';
import { getAssetUrl } from '../utils/formatters';

interface HeroSectionProps {
  totalCount: number;
  spotlightTemplate?: Template;
  onPreviewSpotlight?: (t: Template) => void;
  onQuickSelectStyle?: (style: string) => void;
  selectedStyle?: string;
}

const POPULAR_STYLES = ['Tất cả', 'Minimalist', 'Hàn Quốc (Seoul)', 'Luxury Gold', 'Vintage Classic', 'Rustic Mộc'];

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalCount,
  spotlightTemplate,
  onPreviewSpotlight,
  onQuickSelectStyle,
  selectedStyle = 'Tất cả',
}) => {
  const spotlightImg = spotlightTemplate ? getAssetUrl(spotlightTemplate.longThumbnail || spotlightTemplate.thumbnail) : '';

  return (
    <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-neutral-200/80 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Slogan, Style Pills & Stats */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>L-STUDIO BOUTIQUE &bull; 2026 COLLECTION</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-display text-neutral-900 tracking-tight leading-[1.15]">
              Thiệp cưới điện tử <span className="underline decoration-neutral-300 underline-offset-8">độc bản</span>, tinh tế &amp; tối giản
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
              Khám phá bộ sưu tập <strong>{totalCount} mẫu thiệp cưới</strong> cao cấp đã mở khóa 100%.
              Tùy biến tên dâu rể, giờ đón khách, tích hợp nhạc MP3 lãng mạn và tạo liên kết gửi khách mời qua Zalo trong vài giây.
            </p>

            {/* Quick Style Filter Pills */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                Chọn phong cách bạn yêu thích:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {POPULAR_STYLES.map((style) => {
                  const isActive = selectedStyle === style || (style === 'Tất cả' && !selectedStyle);
                  return (
                    <button
                      key={style}
                      onClick={() => onQuickSelectStyle?.(style === 'Tất cả' ? '' : style)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key Value Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="block font-mono text-xl font-bold text-neutral-900">{totalCount}+</span>
                <span className="text-[11px] text-neutral-500">Mẫu thiệp mở khóa</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="block font-mono text-xl font-bold text-neutral-900">100%</span>
                <span className="text-[11px] text-neutral-500">Miễn phí sử dụng</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="block font-mono text-xl font-bold text-neutral-900">01 Chạm</span>
                <span className="text-[11px] text-neutral-500">Tạo link gửi Zalo</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="block font-mono text-xl font-bold text-neutral-900">VietQR</span>
                <span className="text-[11px] text-neutral-500">Hộp mừng cưới số</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Spotlight Card */}
          {spotlightTemplate && (
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm bg-neutral-900 text-white rounded-2xl p-4 shadow-xl border border-neutral-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-neutral-300">SPOTLIGHT DESIGN</span>
                  </div>
                  <span className="text-neutral-400">{spotlightTemplate.styleTag || 'Minimalist'}</span>
                </div>

                {/* Spotlight Card Preview */}
                <div
                  onClick={() => onPreviewSpotlight?.(spotlightTemplate)}
                  className="relative h-72 bg-neutral-800 rounded-xl overflow-hidden cursor-pointer group mb-3"
                >
                  <img
                    src={spotlightImg}
                    alt={spotlightTemplate.templateName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <h3 className="font-display font-bold text-base text-white">
                        {spotlightTemplate.templateName}
                      </h3>
                      <p className="text-xs text-neutral-300 font-mono mt-0.5">
                        Nhạc nền: {spotlightTemplate.audioTitle || 'Marry You'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action button inside Spotlight */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewSpotlight?.(spotlightTemplate)}
                    className="flex-1 bg-white hover:bg-neutral-100 text-neutral-900 font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem thử mẫu này</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
