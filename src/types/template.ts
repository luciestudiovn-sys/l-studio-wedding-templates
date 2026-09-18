export interface Template {
  id: string;
  templateName: string;
  slug: string;
  categoryId: string;
  templateType: 'basic' | 'premium' | 'free' | string;
  thumbnail: string;
  longThumbnail: string;
  viewCount: number;
  usageCount: number;
  favoriteCount: number;
  sortOrder?: number;
  createdAt?: string;
  audioTitle?: string;
  audioKey?: string;
  audioDuration?: number;
  tags?: string[];
  openingEffect?: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  status: string;
}

export type TemplateFilterType = 'all' | 'basic' | 'premium';

export type SortOption = 'popular' | 'usage' | 'views' | 'newest';

export interface CoupleInfo {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  lunarDate: string;
  venueName: string;
  venueAddress: string;
  invitationMessage: string;
  customSong?: string;
}
