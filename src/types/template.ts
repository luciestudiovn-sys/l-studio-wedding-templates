export interface Template {
  id: string;
  templateName: string;
  slug: string;
  categoryId: string;
  templateType: 'basic' | 'premium' | 'free' | 'unlocked' | string;
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
  styleTag?: string;
  openingEffect?: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  status: string;
}

export type SortOption = 'popular' | 'usage' | 'views' | 'newest';

export interface CoupleInfo {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  lunarDate?: string;
  venueName: string;
  venueAddress: string;
  invitationMessage: string;
  coverImage?: string; // User uploaded wedding photo (Base64 / Blob URL)
  themeColor?: string; // Preset accent color
  fontFamilyChoice?: string;
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
  customSong?: string;
  customAudioUrl?: string; // User uploaded MP3 or chosen track
}
