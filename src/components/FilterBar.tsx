import React from 'react';
import { Search, X, Heart, CheckCircle2 } from 'lucide-react';
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
}) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200/80 shadow-subtle mb-8 space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id && !showOnlyFavorites;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                if (showOnlyFavorites) onToggleFavoritesOnly();
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        {/* Favorites Filter Tab */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
            showOnlyFavorites
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white' : ''}`} />
          <span>Mẫu đã thích</span>
        </button>
      </div>

      {/* Second Row: Search & Sort Controls + Unlocked Status Indicator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Toàn bộ mẫu thiệp đã mở khóa</span>
          </div>
          <span className="hidden md:inline text-neutral-300">|</span>
          <span className="hidden md:inline">
            Hiển thị <strong className="text-neutral-800 font-semibold">{filteredCount}</strong> / {totalCount} mẫu
          </span>
        </div>

        {/* Search & Sort Dropdown */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm tên mẫu thiệp..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white text-neutral-900 transition-all placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="py-2 px-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium text-neutral-700 cursor-pointer"
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
