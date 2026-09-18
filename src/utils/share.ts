import { CoupleInfo, Template } from '../types/template';

export const PUBLIC_PRODUCTION_BASE = 'https://luciestudiovn-sys.github.io/l-studio-wedding-templates/';

/**
 * Returns a public accessible base URL.
 * If running on localhost or dev server, it returns the public GitHub Pages URL so shared links can be opened by anyone.
 * If running in production or custom domain, it uses current origin and pathname.
 */
export function getPublicBaseUrl(): string {
  if (typeof window === 'undefined') {
    return PUBLIC_PRODUCTION_BASE;
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:') {
    return PUBLIC_PRODUCTION_BASE;
  }
  return window.location.origin + window.location.pathname;
}

/**
 * Builds a public shareable invitation URL with all couple details encoded as query parameters.
 */
export function buildInvitationUrl(
  template: Template,
  coupleInfo: CoupleInfo,
  photoPlacement: string = 'arch'
): string {
  const base = getPublicBaseUrl();
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const params = new URLSearchParams();

  params.set('view', 'invitation');
  params.set('id', template.id);
  params.set('slug', template.slug);
  params.set('g', coupleInfo.groomName || '');
  params.set('b', coupleInfo.brideName || '');
  params.set('d', coupleInfo.weddingDate || '');
  params.set('tm', coupleInfo.weddingTime || '');
  if (coupleInfo.lunarDate) params.set('l', coupleInfo.lunarDate);
  params.set('v', coupleInfo.venueName || '');
  params.set('va', coupleInfo.venueAddress || '');
  params.set('m', coupleInfo.invitationMessage || '');
  params.set('c', coupleInfo.themeColor || 'neutral');
  params.set('p', photoPlacement);

  if (coupleInfo.bankName) params.set('bn', coupleInfo.bankName);
  if (coupleInfo.bankAccount) params.set('ba', coupleInfo.bankAccount);
  if (coupleInfo.bankOwner) params.set('bo', coupleInfo.bankOwner);
  if (coupleInfo.customSong) params.set('s', coupleInfo.customSong);

  // If user provided an external image URL, include it in the URL
  if (coupleInfo.coverImage && (coupleInfo.coverImage.startsWith('http://') || coupleInfo.coverImage.startsWith('https://'))) {
    params.set('img', coupleInfo.coverImage);
  }

  // Also persist to localStorage for cross-tab or local preview
  try {
    const payload = {
      templateId: template.id,
      templateSlug: template.slug,
      coupleInfo,
      photoPlacement,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`l_studio_invite_${template.id}`, JSON.stringify(payload));
    localStorage.setItem('l_studio_latest_invite', JSON.stringify(payload));
  } catch (err) {
    console.warn('Unable to persist invitation in localStorage', err);
  }

  return `${cleanBase}?${params.toString()}`;
}

export interface ParsedInvitation {
  isInvitationView: boolean;
  templateId: string | null;
  templateSlug: string | null;
  coupleInfo: CoupleInfo | null;
  photoPlacement: 'arch' | 'circle' | 'rounded' | 'hero';
}

/**
 * Parses invitation parameters from current window URL.
 */
export function parseInvitationFromUrl(): ParsedInvitation {
  if (typeof window === 'undefined') {
    return {
      isInvitationView: false,
      templateId: null,
      templateSlug: null,
      coupleInfo: null,
      photoPlacement: 'arch',
    };
  }

  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const isInvitation = view === 'invitation' || params.has('invite');

  if (!isInvitation) {
    return {
      isInvitationView: false,
      templateId: null,
      templateSlug: null,
      coupleInfo: null,
      photoPlacement: 'arch',
    };
  }

  const templateId = params.get('id');
  const templateSlug = params.get('slug');
  const photoPlacement = (params.get('p') as any) || 'arch';

  // Check if we have saved data locally for this invitation (e.g. including base64 photo)
  let localData: any = null;
  try {
    const raw = (templateId && localStorage.getItem(`l_studio_invite_${templateId}`)) ||
                localStorage.getItem('l_studio_latest_invite');
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read local invite data', err);
  }

  const coupleInfo: CoupleInfo = {
    groomName: params.get('g') || localData?.coupleInfo?.groomName || 'Nguyễn Hoàng Nam',
    brideName: params.get('b') || localData?.coupleInfo?.brideName || 'Trần Mai Linh',
    weddingDate: params.get('d') || localData?.coupleInfo?.weddingDate || '2026-10-25',
    weddingTime: params.get('tm') || localData?.coupleInfo?.weddingTime || '11:30',
    lunarDate: params.get('l') || localData?.coupleInfo?.lunarDate || '15 tháng 09 năm Bính Ngọ',
    venueName: params.get('v') || localData?.coupleInfo?.venueName || 'Trung Tâm Tiệc Cưới White Palace',
    venueAddress: params.get('va') || localData?.coupleInfo?.venueAddress || '194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh',
    invitationMessage: params.get('m') || localData?.coupleInfo?.invitationMessage || 'Sự hiện diện của quý khách là niềm vinh hạnh lớn nhất cho gia đình chúng tôi!',
    coverImage: params.get('img') || localData?.coupleInfo?.coverImage || '',
    themeColor: params.get('c') || localData?.coupleInfo?.themeColor || 'neutral',
    bankName: params.get('bn') || localData?.coupleInfo?.bankName || 'vietcombank',
    bankAccount: params.get('ba') || localData?.coupleInfo?.bankAccount || '9988776655',
    bankOwner: params.get('bo') || localData?.coupleInfo?.bankOwner || 'NGUYEN HOANG NAM',
    customSong: params.get('s') || localData?.coupleInfo?.customSong || '',
  };

  return {
    isInvitationView: true,
    templateId,
    templateSlug,
    coupleInfo,
    photoPlacement,
  };
}
