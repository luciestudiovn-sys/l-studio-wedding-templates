import React from 'react';
import { Search, X, Heart, CheckCircle2, LayoutGrid, Grid } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { SortOption } from '../types/template';

interface FilterBarProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  showOnlyFavorites: boolean;
  onToggleFavoritesOnly: () => void;
  filteredCount: number;
  totalCount: number;
  viewMode: 'dense' | 'spacious';
  onToggleViewMode: (mode: 'dense' | 'spacious') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  showOnlyFavorites,
  onToggleFavoritesOnly,
  filteredCount,
  totalCount,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div id="bo-suu-tap" className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200/80 shadow-subtle mb-6 space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id && !showOnlyFavorites;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  if (showOnlyFavorites) onToggleFavoritesOnly();
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm font-semibold'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          <button
            onClick={onToggleFavoritesOnly}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
              showOnlyFavorites
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white' : ''}`} />
            <span>Đã lưu thích</span>
          </button>
        </div>

        {/* View mode toggle button */}
        <div className="hidden sm:flex items-center gap-1 border-l border-neutral-200 pl-3">
          <button
            onClick={() => onToggleViewMode('dense')}
            title="Lưới 4 cột (Chuẩn)"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'dense' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleViewMode('spacious')}
            title="Lưới 3 cột (Thẻ lớn)"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'spacious' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Second Row: Status Indicator, Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
        {/* Status Count */}
        <div className="flex items-center gap-2 text-neutral-500 font-mono">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>134/134 UNLOCKED</span>
          </div>
          <span className="text-neutral-300">|</span>
          <span>
            {filteredCount} / {totalCount} mẫu hiển thị
          </span>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên, bài hát..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white text-neutral-900 placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="py-1.5 px-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium text-neutral-700 cursor-pointer"
          >
            <option value="popular">Phổ biến nhất</option>
            <option value="usage">Dùng nhiều nhất</option>
            <option value="views">Lượt xem cao</option>
            <option value="newest">Mới cập nhật</option>
          </select>
        </div>
      </div>
    </div>
  );
};
