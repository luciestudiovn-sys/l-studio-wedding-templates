import React, { useState } from 'react';
import { Eye, Heart, QrCode, Music2, Check, Sparkles } from 'lucide-react';
import { Template } from '../types/template';
import { formatCount, getAssetUrl } from '../utils/formatters';

interface TemplateCardProps {
  template: Template;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPreview: (template: Template) => void;
  onUseTemplate: (template: Template) => void;
  onShowQR: (template: Template) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onUseTemplate,
  onShowQR,
}) => {
  const [imgError, setImgError] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const imgUrl = getAssetUrl(template.longThumbnail || template.thumbnail);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    onToggleFavorite(template.id);
  };

  return (
    <div className="template-card group bg-white rounded-xl overflow-hidden border border-neutral-200/80 shadow-subtle hover:shadow-hover-clean hover:border-neutral-300 transition-all duration-300 flex flex-col">
      {/* Thumbnail Container with hover auto-scroll preview */}
      <div
        onClick={() => onPreview(template)}
        className="relative h-[380px] sm:h-[420px] bg-neutral-100 overflow-hidden cursor-pointer"
      >
        {/* Long Image Preview with CSS translate transition */}
        {!imgError ? (
          <img
            src={imgUrl}
            alt={template.templateName}
            loading="lazy"
            onError={() => setImgError(true)}
            className="card-long-thumb w-full object-cover object-top will-change-transform"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-6 text-center">
            <span className="text-sm font-medium">{template.templateName}</span>
          </div>
        )}

        {/* Top Badges: UNLOCKED 100% FOR ALL TEMPLATES */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/95 backdrop-blur-sm text-neutral-800 shadow-sm border border-neutral-200/80 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            <span>Đã mở khóa</span>
          </span>

          {template.audioTitle && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-900/80 backdrop-blur-sm text-neutral-200 flex items-center gap-1">
              <Music2 className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]">{template.audioTitle}</span>
            </span>
          )}
        </div>

        {/* Top-Right Favorite Button */}
        <button
          onClick={handleHeartClick}
          title={isFavorite ? 'Bỏ thích' : 'Yêu thích'}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm shadow-sm border border-neutral-200/60 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all duration-300 ${
              isFavorite ? 'fill-neutral-900 text-neutral-900' : 'text-neutral-600'
            } ${heartAnim ? 'scale-125' : ''}`}
          />
        </button>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              className="flex-1 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold py-2.5 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onUseTemplate(template);
              }}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold py-2.5 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Dùng mẫu</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowQR(template);
              }}
              title="Quét mã QR"
              className="bg-white hover:bg-neutral-100 text-neutral-900 p-2.5 rounded-lg shadow-sm transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors text-sm line-clamp-1">
            {template.templateName}
          </h3>
          <p className="text-[11px] text-neutral-400 capitalize mt-0.5">
            {template.categoryId.replace('-', ' ')}
          </p>
        </div>

        {/* Minimalist Stats footer */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 mt-3 border-t border-neutral-100">
          <span className="text-neutral-600 font-medium">
            {formatCount(template.usageCount)} lượt dùng
          </span>
          <div className="flex items-center gap-2">
            <span>{formatCount(template.viewCount)} xem</span>
            <span className="flex items-center gap-1 text-neutral-600">
              <Heart className="w-3 h-3 fill-neutral-400 text-neutral-400" />
              {formatCount(template.favoriteCount + (isFavorite ? 1 : 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
