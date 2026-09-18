import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Template } from '../types/template';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  templates: Template[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onPreview: (template: Template) => void;
  onUseTemplate: (template: Template) => void;
  onShowQR: (template: Template) => void;
  onResetFilters: () => void;
  viewMode?: 'dense' | 'spacious';
  onPlaySong?: (template: Template) => void;
  currentPlayingSongId?: string;
}

const PAGE_SIZE = 12;

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  favoriteIds,
  onToggleFavorite,
  onPreview,
  onUseTemplate,
  onShowQR,
  onResetFilters,
  viewMode = 'dense',
  onPlaySong,
  currentPlayingSongId,
}) => {
  const [displayCount, setDisplayCount] = useState<number>(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const displayedTemplates = templates.slice(0, displayCount);
  const hasMore = displayCount < templates.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 250);
  };

  if (templates.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-subtle p-8">
        <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 font-display mb-1.5">
          Không tìm thấy mẫu thiệp phù hợp
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mb-5 font-sans">
          Thử chọn phong cách khác hoặc xóa từ khóa tìm kiếm để khám phá thêm nhiều mẫu thiệp cưới đẹp.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-medium px-5 py-2 rounded-xl transition-all font-display"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    );
  }

  const gridClass = viewMode === 'spacious'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';

  return (
    <div className="space-y-8">
      {/* Template Cards Grid */}
      <div className={gridClass}>
        {displayedTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isFavorite={favoriteIds.has(template.id)}
            onToggleFavorite={onToggleFavorite}
            onPreview={onPreview}
            onUseTemplate={onUseTemplate}
            onShowQR={onShowQR}
            onPlaySong={onPlaySong}
            isPlayingThisSong={currentPlayingSongId === template.id}
          />
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center pt-2">
        {hasMore ? (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-7 py-3 rounded-xl border border-neutral-300 shadow-subtle hover:shadow-md transition-all text-xs sm:text-sm disabled:opacity-50 font-display"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-700" />
                <span>Đang tải thêm...</span>
              </>
            ) : (
              <>
                <span>Xem thêm ({templates.length - displayCount} mẫu tiếp theo)</span>
              </>
            )}
          </button>
        ) : (
          <p className="text-xs text-neutral-400 font-mono italic">
            &bull; Đã hiển thị trọn vẹn toàn bộ {templates.length} mẫu thiệp &bull;
          </p>
        )}
      </div>
    </div>
  );
};
