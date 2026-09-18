import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { TemplateGrid } from './components/TemplateGrid';
import { ServiceBanner } from './components/ServiceBanner';
import { Footer } from './components/Footer';
import { PreviewModal } from './components/PreviewModal';
import { QuickEditorModal, PhotoPlacement } from './components/QuickEditorModal';
import { LiveInvitationView } from './components/LiveInvitationView';
import { GlobalMusicPlayer } from './components/GlobalMusicPlayer';
import templatesData from './data/templates.json';
import { Template, SortOption, CoupleInfo } from './types/template';
import { getFavoriteIds, toggleFavoriteId } from './utils/storage';
import { parseInvitationFromUrl } from './utils/share';

const typedTemplates: Template[] = templatesData as Template[];

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(getFavoriteIds);
  const [viewMode, setViewMode] = useState<'dense' | 'spacious'>('dense');

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editorTemplate, setEditorTemplate] = useState<Template | null>(null);

  // Standalone Full-Screen Guest Invitation View state
  const [liveInvitation, setLiveInvitation] = useState<{
    template: Template;
    coupleInfo: CoupleInfo;
    photoPlacement: PhotoPlacement;
  } | null>(null);

  // Global Audio Player state
  const [activeAudioTemplate, setActiveAudioTemplate] = useState<Template | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Check URL query parameters on load
  useEffect(() => {
    // 1. Check if guest is opening a shared invitation link (?view=invitation&...)
    const parsed = parseInvitationFromUrl();
    if (parsed.isInvitationView && parsed.coupleInfo) {
      const match =
        typedTemplates.find(
          (t) => t.id === parsed.templateId || t.slug === parsed.templateSlug
        ) || typedTemplates[0];
      if (match) {
        setLiveInvitation({
          template: match,
          coupleInfo: parsed.coupleInfo,
          photoPlacement: parsed.photoPlacement,
        });
        return;
      }
    }

    // 2. Check if user clicked direct template preview link (?template=slug)
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

  const handlePlaySong = (template: Template) => {
    if (activeAudioTemplate?.id === template.id) {
      setIsAudioPlaying(!isAudioPlaying);
    } else {
      setActiveAudioTemplate(template);
      setIsAudioPlaying(true);
    }
  };

  const filteredTemplates = useMemo(() => {
    return typedTemplates.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Style tag filter
      if (selectedStyle && item.styleTag !== selectedStyle) {
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
        const styleMatch = (item.styleTag || '').toLowerCase().includes(q);
        if (!nameMatch && !slugMatch && !audioMatch && !styleMatch) {
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
  }, [selectedCategory, selectedStyle, searchQuery, sortOption, showOnlyFavorites, favoriteIds]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedStyle('');
    setSearchQuery('');
    setSortOption('popular');
    setShowOnlyFavorites(false);
  };

  // IF GUEST IS VIEWING A CUSTOMIZED INVITATION
  if (liveInvitation) {
    return (
      <LiveInvitationView
        template={liveInvitation.template}
        coupleInfo={liveInvitation.coupleInfo}
        photoPlacement={liveInvitation.photoPlacement}
        onBackToStudio={() => {
          setLiveInvitation(null);
          try {
            const url = new URL(window.location.href);
            url.search = '';
            window.history.pushState({}, '', url.pathname);
          } catch (e) {}
        }}
      />
    );
  }

  // STANDARD L-STUDIO CATALOG VIEW
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-neutral-800 selection:bg-neutral-200 selection:text-neutral-900 font-sans">
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

      {/* Hero Section with Spotlight Card */}
      <HeroSection
        totalCount={typedTemplates.length}
        spotlightTemplate={typedTemplates[0]}
        onPreviewSpotlight={setPreviewTemplate}
        onQuickSelectStyle={setSelectedStyle}
        selectedStyle={selectedStyle}
      />

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
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
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
          viewMode={viewMode}
          onPlaySong={handlePlaySong}
          currentPlayingSongId={isAudioPlaying ? activeAudioTemplate?.id : undefined}
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

      {/* Sticky Bottom Music Player */}
      <GlobalMusicPlayer
        currentTemplate={activeAudioTemplate}
        isPlaying={isAudioPlaying}
        onTogglePlay={() => setIsAudioPlaying(!isAudioPlaying)}
        onClosePlayer={() => {
          setIsAudioPlaying(false);
          setActiveAudioTemplate(null);
        }}
      />

      {/* Mobile Phone Simulator Preview Modal */}
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

      {/* Quick Customizer Modal with VietQR and Wedding Countdown */}
      <QuickEditorModal
        template={editorTemplate}
        isOpen={Boolean(editorTemplate)}
        onClose={() => setEditorTemplate(null)}
        onOpenLiveInvitation={(tmpl, cInfo, placement) => {
          setEditorTemplate(null);
          setLiveInvitation({ template: tmpl, coupleInfo: cInfo, photoPlacement: placement });
        }}
      />
    </div>
  );
};
