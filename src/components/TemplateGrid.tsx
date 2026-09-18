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
    }, 300);
  };

  if (templates.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 font-serif mb-2">
          Không tìm thấy mẫu thiệp phù hợp
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác để khám phá thêm nhiều mẫu thiệp đẹp.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Grid of Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isFavorite={favoriteIds.has(template.id)}
            onToggleFavorite={onToggleFavorite}
            onPreview={onPreview}
            onUseTemplate={onUseTemplate}
            onShowQR={onShowQR}
          />
        ))}
      </div>

      {/* Pagination / Load More Button */}
      <div className="text-center pt-4">
        {hasMore ? (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-8 py-3.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all text-sm disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                <span>Đang tải thêm...</span>
              </>
            ) : (
              <>
                <span>Xem thêm mẫu thiệp ({templates.length - displayCount} mẫu còn lại)</span>
              </>
            )}
          </button>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Đã hiển thị tất cả {templates.length} mẫu thiệp
          </p>
        )}
      </div>
    </div>
  );
};
