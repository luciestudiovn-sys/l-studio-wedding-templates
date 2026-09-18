import React, { useState } from 'react';
import { Heart, Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  favoriteCount: number;
  onOpenFavorites?: () => void;
  onOpenNewBlank?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ favoriteCount, onOpenFavorites, onOpenNewBlank }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* L-Studio Brand Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-display text-xl font-bold tracking-wider group-hover:bg-neutral-800 transition-colors shadow-sm">
                L
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-neutral-900 font-display">
                    L-STUDIO
                  </span>
                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                    v2.0
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  Wedding &amp; Invitations
                </span>
              </div>
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-8">
            <a href="#" className="text-neutral-500 hover:text-neutral-900 px-2 py-1 text-sm font-medium transition-colors">
              Trang chủ
            </a>
            <a href="#bo-suu-tap" className="text-neutral-900 font-semibold px-2 py-1 text-sm relative after:absolute after:bottom-[-6px] after:left-2 after:right-2 after:h-[2px] after:bg-neutral-900">
              Bộ sưu tập 134+ mẫu
            </a>
            <a href="#dich-vu" className="text-neutral-500 hover:text-neutral-900 px-2 py-1 text-sm font-medium transition-colors">
              Dịch vụ trọn gói
            </a>
            <a href="#lien-he" className="text-neutral-500 hover:text-neutral-900 px-2 py-1 text-sm font-medium transition-colors">
              Liên hệ studio
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Favorites Button */}
            <button
              onClick={onOpenFavorites}
              title="Danh sách mẫu đã thích"
              className="relative p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors flex items-center justify-center"
            >
              <Heart className={`w-5 h-5 ${favoriteCount > 0 ? 'fill-neutral-900 text-neutral-900' : ''}`} />
              {favoriteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-neutral-900 text-white text-[10px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Customizer CTA */}
            <button
              onClick={onOpenNewBlank}
              className="hidden sm:inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tạo thiệp riêng</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-2 shadow-sm">
          <a href="#" className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
            Trang chủ
          </a>
          <a href="#bo-suu-tap" className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-900 bg-neutral-100">
            Bộ sưu tập 134+ mẫu
          </a>
          <a href="#dich-vu" className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
            Dịch vụ trọn gói
          </a>
          <a href="#lien-he" className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
            Liên hệ studio
          </a>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenNewBlank?.();
              }}
              className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white font-medium py-2.5 rounded-xl text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Tạo thiệp riêng</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
