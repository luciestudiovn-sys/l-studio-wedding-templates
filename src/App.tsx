import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { TemplateGrid } from './components/TemplateGrid';
import { ServiceBanner } from './components/ServiceBanner';
import { Footer } from './components/Footer';
import { PreviewModal } from './components/PreviewModal';
import { QuickEditorModal } from './components/QuickEditorModal';
import templatesData from './data/templates.json';
import { Template, SortOption } from './types/template';
import { getFavoriteIds, toggleFavoriteId } from './utils/storage';

const typedTemplates: Template[] = templatesData as Template[];

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(getFavoriteIds);

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editorTemplate, setEditorTemplate] = useState<Template | null>(null);

  // Check URL query param for direct template preview (?template=slug)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('template');
    if (slug) {
      const match = typedTemplates.find((t) => t.slug === slug);
      if (match) {
        setPreviewTemplate(match);
      }
    }
  }, []);

  const handleToggleFavorite = (id: string) => {
    const { newFavorites } = toggleFavoriteId(id);
    setFavoriteIds(new Set(newFavorites));
  };

  const filteredTemplates = useMemo(() => {
    return typedTemplates.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Favorites filter
      if (showOnlyFavorites && !favoriteIds.has(item.id)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.templateName.toLowerCase().includes(q);
        const slugMatch = item.slug.toLowerCase().includes(q);
        const audioMatch = (item.audioTitle || '').toLowerCase().includes(q);
        if (!nameMatch && !slugMatch && !audioMatch) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortOption === 'popular') {
        return (a.sortOrder || 999) - (b.sortOrder || 999) || (b.usageCount - a.usageCount);
      }
      if (sortOption === 'usage') {
        return b.usageCount - a.usageCount;
      }
      if (sortOption === 'views') {
        return b.viewCount - a.viewCount;
      }
      if (sortOption === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });
  }, [selectedCategory, searchQuery, sortOption, showOnlyFavorites, favoriteIds]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortOption('popular');
    setShowOnlyFavorites(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-neutral-800 selection:bg-neutral-200 selection:text-neutral-900">
      {/* Header */}
      <Header
        favoriteCount={favoriteIds.size}
        onOpenFavorites={() => setShowOnlyFavorites(true)}
        onOpenNewBlank={() => {
          if (typedTemplates.length > 0) {
            setEditorTemplate(typedTemplates[0]);
          }
        }}
      />

      {/* Hero Section */}
      <HeroSection totalCount={typedTemplates.length} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setShowOnlyFavorites(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          showOnlyFavorites={showOnlyFavorites}
          onToggleFavoritesOnly={() => setShowOnlyFavorites(!showOnlyFavorites)}
          filteredCount={filteredTemplates.length}
          totalCount={typedTemplates.length}
        />

        {/* Template Grid */}
        <TemplateGrid
          templates={filteredTemplates}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onPreview={setPreviewTemplate}
          onUseTemplate={setEditorTemplate}
          onShowQR={setPreviewTemplate}
          onResetFilters={handleResetFilters}
        />

        {/* Service Banner */}
        <ServiceBanner
          onOpenConsult={() => {
            if (typedTemplates.length > 0) {
              setEditorTemplate(typedTemplates[0]);
            }
          }}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Mobile Phone Preview Modal with Real-time Music Player & QR Code */}
      <PreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        isFavorite={previewTemplate ? favoriteIds.has(previewTemplate.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onUseTemplate={(t) => {
          setPreviewTemplate(null);
          setEditorTemplate(t);
        }}
      />

      {/* Quick Customizer Modal */}
      <QuickEditorModal
        template={editorTemplate}
        isOpen={Boolean(editorTemplate)}
        onClose={() => setEditorTemplate(null)}
      />
    </div>
  );
};
