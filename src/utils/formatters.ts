import { CDN_BASE } from '../data/categories';

export function formatCount(n: number | undefined): string {
  if (n === undefined || n === null) return '0';
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toLocaleString('vi-VN');
}

export function getAssetUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CDN_BASE}${cleanPath}`;
}

export function getAudioUrl(audioKey: string | undefined): string {
  if (!audioKey) {
    return `${CDN_BASE}mp3/f6d43906-8c24-4236-b385-0a708c7ffe0d.mp3`; // default Marry You
  }
  return getAssetUrl(audioKey);
}
