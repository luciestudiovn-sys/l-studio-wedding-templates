import { Category } from '../types/template';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Tất cả', order: 0, status: 'active' },
  { id: 'thiep-cuoi', name: 'Thiệp cưới', order: 1, status: 'active' },
  { id: 'thiep-sinh-nhat', name: 'Thiệp sinh nhật', order: 2, status: 'active' },
  { id: 'thiep-tot-nghiep', name: 'Thiệp tốt nghiệp', order: 3, status: 'active' },
  { id: 'su-kien', name: 'Sự kiện', order: 4, status: 'active' },
  { id: 'ky-niem', name: 'Kỷ niệm', order: 5, status: 'active' },
];

export const CDN_BASE = 'https://assets.cinelove.me/';
