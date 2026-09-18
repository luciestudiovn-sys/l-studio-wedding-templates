import { Template } from '../types/template';

export interface TemplateTheme {
  id: string;
  name: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  fontFamily: string;
  monogramStyle: string;
  buttonBg: string;
  ornamentStyle: string;
}

export function getTemplateTheme(template: Template): TemplateTheme {
  const slug = template.slug || '';
  const idNum = parseInt(slug.replace(/[^0-9]/g, '')) || 1;
  const bucket = idNum % 5;

  switch (bucket) {
    case 0:
      // Luxury Gold Hoàng Gia (Dark & Gold)
      return {
        id: 'luxury-gold',
        name: 'Luxury Gold Hoàng Gia',
        bgGradient: 'from-[#141210] via-[#1a1714] to-[#221e19]',
        cardBg: 'bg-[#24201b]/95 backdrop-blur-md',
        textColor: 'text-amber-100',
        subtextColor: 'text-amber-300/75',
        accentColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border border-amber-500/40',
        badgeText: 'text-amber-300',
        borderColor: 'border-amber-500/30',
        fontFamily: 'font-serif',
        monogramStyle: 'border-amber-400/50 bg-[#2a2520] text-amber-300 shadow-amber-950/50 shadow-md',
        buttonBg: 'bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 font-bold hover:brightness-110',
        ornamentStyle: 'text-amber-400/60',
      };
    case 1:
      // Romantic Rose / Hoa Cỏ Pastel Lãng Mạn
      return {
        id: 'romantic-rose',
        name: 'Hồng Pastel Lãng Mạn',
        bgGradient: 'from-[#fff5f6] via-[#fdf8f8] to-[#faedf0]',
        cardBg: 'bg-white/95 backdrop-blur-md',
        textColor: 'text-rose-950',
        subtextColor: 'text-rose-700/75',
        accentColor: 'text-rose-600',
        badgeBg: 'bg-rose-100 border border-rose-200',
        badgeText: 'text-rose-800',
        borderColor: 'border-rose-200/80',
        fontFamily: 'font-serif',
        monogramStyle: 'border-rose-300 bg-rose-50 text-rose-700 shadow-rose-200/50 shadow-sm',
        buttonBg: 'bg-gradient-to-r from-rose-600 to-pink-500 text-white font-semibold hover:opacity-95',
        ornamentStyle: 'text-rose-300',
      };
    case 2:
      // Botanical Sage Tự Nhiên
      return {
        id: 'botanical-sage',
        name: 'Xanh Sage Tự Nhiên',
        bgGradient: 'from-[#f2f7f3] via-[#f8faf8] to-[#eaf2eb]',
        cardBg: 'bg-white/95 backdrop-blur-md',
        textColor: 'text-emerald-950',
        subtextColor: 'text-emerald-700/75',
        accentColor: 'text-emerald-700',
        badgeBg: 'bg-emerald-100 border border-emerald-200',
        badgeText: 'text-emerald-800',
        borderColor: 'border-emerald-200/80',
        fontFamily: 'font-serif',
        monogramStyle: 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-emerald-200/50 shadow-sm',
        buttonBg: 'bg-gradient-to-r from-emerald-700 to-teal-600 text-white font-semibold hover:opacity-95',
        ornamentStyle: 'text-emerald-300',
      };
    case 3:
      // Vintage Classic Cổ Điển
      return {
        id: 'vintage-warm',
        name: 'Vintage Cổ Điển',
        bgGradient: 'from-[#faf6ef] via-[#fdfbf7] to-[#f5eee3]',
        cardBg: 'bg-white/95 backdrop-blur-md',
        textColor: 'text-stone-900',
        subtextColor: 'text-stone-600',
        accentColor: 'text-amber-800',
        badgeBg: 'bg-amber-100/70 border border-amber-300/60',
        badgeText: 'text-amber-900',
        borderColor: 'border-amber-900/20',
        fontFamily: 'font-serif',
        monogramStyle: 'border-amber-800/40 bg-[#f7f0e4] text-amber-900 shadow-stone-300 shadow-sm',
        buttonBg: 'bg-gradient-to-r from-stone-800 to-amber-900 text-white font-semibold hover:opacity-95',
        ornamentStyle: 'text-amber-800/40',
      };
    default:
      // Tối Giản Hiện Đại (Minimalist)
      return {
        id: 'modern-minimal',
        name: 'Tối Giản Hiện Đại',
        bgGradient: 'from-[#f8f8f8] via-white to-[#f0f0f0]',
        cardBg: 'bg-white/95 backdrop-blur-md',
        textColor: 'text-neutral-900',
        subtextColor: 'text-neutral-500',
        accentColor: 'text-neutral-900',
        badgeBg: 'bg-neutral-100 border border-neutral-200',
        badgeText: 'text-neutral-800',
        borderColor: 'border-neutral-200',
        fontFamily: 'font-sans',
        monogramStyle: 'border-neutral-300 bg-neutral-100 text-neutral-900 shadow-neutral-200 shadow-sm',
        buttonBg: 'bg-neutral-900 text-white font-semibold hover:bg-neutral-800',
        ornamentStyle: 'text-neutral-300',
      };
  }
}
