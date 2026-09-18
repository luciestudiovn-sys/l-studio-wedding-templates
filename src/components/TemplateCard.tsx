import React, { useState } from 'react';
import { Eye, Heart, QrCode, Check, Sparkles, Play, Pause } from 'lucide-react';
import { Template } from '../types/template';
import { formatCount, getAssetUrl } from '../utils/formatters';

interface TemplateCardProps {
  template: Template;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPreview: (template: Template) => void;
  onUseTemplate: (template: Template) => void;
  onShowQR: (template: Template) => void;
  onPlaySong?: (template: Template) => void;
  isPlayingThisSong?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onUseTemplate,
  onShowQR,
  onPlaySong,
  isPlayingThisSong = false,
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

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlaySong?.(template);
  };

  return (
    <div className="template-card group bg-white rounded-xl overflow-hidden border border-neutral-200/80 shadow-subtle hover:shadow-hover-card hover:border-neutral-300 transition-all duration-300 flex flex-col">
      {/* Thumbnail Container with hover auto-scroll preview */}
      <div
        onClick={() => onPreview(template)}
        className="relative h-[360px] sm:h-[400px] bg-neutral-100 overflow-hidden cursor-pointer"
      >
        {/* Long Image Preview */}
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
            <span className="text-xs font-mono">{template.templateName}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          {/* Style Badge */}
          {template.styleTag && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-900 text-white shadow-sm">
              {template.styleTag}
            </span>
          )}

          {/* Unlocked tag */}
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
            <span>Mở khóa</span>
          </span>
        </div>

        {/* Play Audio Quick Pill */}
        {template.audioTitle && (
          <button
            onClick={handlePlayAudio}
            title={isPlayingThisSong ? 'Tạm dừng nhạc' : 'Nghe thử nhạc thiệp này'}
            className={`absolute bottom-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium backdrop-blur-md border transition-all flex items-center gap-1.5 ${
              isPlayingThisSong
                ? 'bg-neutral-900 text-white border-neutral-700 shadow-md'
                : 'bg-black/60 hover:bg-black/80 text-neutral-200 border-white/20'
            }`}
          >
            {isPlayingThisSong ? (
              <Pause className="w-2.5 h-2.5 text-amber-300" />
            ) : (
              <Play className="w-2.5 h-2.5 text-white ml-0.5" />
            )}
            <span className="truncate max-w-[90px]">{template.audioTitle}</span>
          </button>
        )}

        {/* Top-Right Favorite Button */}
        <button
          onClick={handleHeartClick}
          title={isFavorite ? 'Bỏ thích' : 'Yêu thích'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-neutral-200/60 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all duration-300 ${
              isFavorite ? 'fill-neutral-900 text-neutral-900' : 'text-neutral-600'
            } ${heartAnim ? 'scale-125' : ''}`}
          />
        </button>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-neutral-950/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex items-center gap-1.5 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              className="flex-1 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold py-2 px-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onUseTemplate(template);
              }}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1 transition-all"
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
              className="bg-white hover:bg-neutral-100 text-neutral-900 p-2 rounded-lg shadow-sm transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-display font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors text-sm line-clamp-1">
              {template.templateName}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mt-0.5">
            <span className="capitalize">{template.categoryId.replace('-', ' ')}</span>
            <span>{template.slug}</span>
          </div>
        </div>

        {/* Stats footer */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-2.5 mt-2.5 border-t border-neutral-100">
          <span>{formatCount(template.usageCount)} lượt dùng</span>
          <div className="flex items-center gap-2">
            <span>{formatCount(template.viewCount)} xem</span>
            <span className="flex items-center gap-1 text-neutral-700 font-medium">
              <Heart className="w-3 h-3 fill-neutral-400 text-neutral-400" />
              {formatCount(template.favoriteCount + (isFavorite ? 1 : 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
