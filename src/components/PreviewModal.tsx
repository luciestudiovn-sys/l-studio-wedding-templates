import React, { useState, useEffect } from 'react';
import { X, Heart, QrCode, Share2, Check, Smartphone, Music2, CheckCircle2, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import { Template } from '../types/template';
import { formatCount, getAssetUrl } from '../utils/formatters';
import { AudioPlayerPill } from './AudioPlayerPill';
import { getPublicBaseUrl } from '../utils/share';

interface PreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onUseTemplate: (template: Template) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onUseTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'qr'>('preview');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (template && isOpen) {
      const base = getPublicBaseUrl();
      const cleanBase = base.endsWith('/') ? base : base + '/';
      const shareUrl = `${cleanBase}?template=${template.slug}`;
      QRCode.toDataURL(shareUrl, { width: 240, margin: 2, color: { dark: '#171717', light: '#ffffff' } })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [template, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const imgUrl = getAssetUrl(template.longThumbnail || template.thumbnail);

  const handleCopyLink = () => {
    const base = getPublicBaseUrl();
    const cleanBase = base.endsWith('/') ? base : base + '/';
    navigator.clipboard.writeText(`${cleanBase}?template=${template.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col lg:flex-row my-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT / CENTER: Minimalist Mobile Phone Simulator */}
        <div className="flex-1 bg-neutral-950 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute w-80 h-80 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none" />

          {/* Minimalist iPhone Frame Container */}
          <div className="relative w-[300px] sm:w-[330px] h-[580px] sm:h-[630px] bg-neutral-900 rounded-[48px] p-2.5 shadow-2xl border-2 border-neutral-700/70 flex flex-col">
            {/* Dynamic Island Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-between px-2.5">
              <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse" />
            </div>

            {/* Inner Phone Screen */}
            <div className="w-full h-full bg-white rounded-[38px] overflow-hidden relative flex flex-col">
              {/* Phone Status Bar */}
              <div className="h-8 bg-transparent w-full flex items-center justify-between px-6 pt-1 text-[11px] font-semibold text-neutral-800 z-10 pointer-events-none">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-2 border border-neutral-800 rounded-sm" />
                </div>
              </div>

              {/* Scrollable Invitation Content or QR Code */}
              {activeTab === 'preview' ? (
                <div className="flex-1 overflow-y-auto preview-scrollbar relative bg-neutral-50">
                  <img
                    src={imgUrl}
                    alt={template.templateName}
                    className="w-full h-auto object-cover select-none"
                  />
                  {/* Floating music player pill inside phone */}
                  <div className="sticky bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-auto">
                    <AudioPlayerPill
                      audioKey={template.audioKey}
                      audioTitle={template.audioTitle || 'Marry You'}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">
                    Quét mã QR để xem trên điện thoại
                  </h4>
                  <p className="text-xs text-neutral-500 mb-6">
                    Mở camera điện thoại quét mã để xem trực tiếp thiệp của L-Studio
                  </p>
                  {qrCodeUrl ? (
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-neutral-200 inline-block mb-4">
                      <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44" />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                      Đang tạo mã QR...
                    </div>
                  )}
                  <span className="text-xs text-neutral-800 font-medium bg-neutral-100 px-3 py-1 rounded-md">
                    {template.templateName}
                  </span>
                </div>
              )}

              {/* Phone Bottom Home Indicator */}
              <div className="h-3.5 bg-transparent w-full flex items-center justify-center pb-1 pointer-events-none">
                <div className="w-24 h-1 bg-neutral-300 rounded-full" />
              </div>
            </div>
          </div>

          {/* Toggle buttons under phone */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'preview' ? 'bg-white text-neutral-900' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Xem trực tiếp</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'qr' ? 'bg-white text-neutral-900' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Quét mã QR</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Template Details & Action Sidebar */}
        <div className="w-full lg:w-[380px] bg-neutral-900 border-t lg:border-t-0 lg:border-l border-neutral-800 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Badges: ALL UNLOCKED */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã mở khóa toàn bộ</span>
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-300 capitalize">
                {template.categoryId.replace('-', ' ')}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white font-display mb-1">
              {template.templateName}
            </h2>

            <p className="text-xs text-neutral-400 mb-6 font-mono">
              Mã thiết kế: <code className="text-neutral-300">{template.slug}</code>
            </p>

            {/* Stats list */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-800/70 rounded-xl border border-neutral-700/60 mb-6 text-center font-mono">
              <div>
                <span className="block text-base font-bold text-white">
                  {formatCount(template.usageCount)}
                </span>
                <span className="text-[11px] text-neutral-400">Lượt dùng</span>
              </div>
              <div className="border-x border-neutral-700/60">
                <span className="block text-base font-bold text-white">
                  {formatCount(template.viewCount)}
                </span>
                <span className="text-[11px] text-neutral-400">Lượt xem</span>
              </div>
              <div>
                <span className="block text-base font-bold text-white">
                  {formatCount(template.favoriteCount + (isFavorite ? 1 : 0))}
                </span>
                <span className="text-[11px] text-neutral-400">Yêu thích</span>
              </div>
            </div>

            {/* Music Info card */}
            <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-700 text-white flex items-center justify-center">
                  <Music2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[11px] text-neutral-400 font-mono">Nhạc nền tích hợp</span>
                  <span className="text-xs font-semibold text-white">
                    {template.audioTitle || 'Marry You'}
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-2 text-xs text-neutral-300 mb-6 font-sans">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span>Cho phép tải ảnh dâu rể thật từ máy lên thiệp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span>Hỗ trợ xuất ảnh thiệp HD (PNG) để gửi Zalo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span>Tự động tạo mã chuyển khoản mừng cưới VietQR</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4 border-t border-neutral-800">
            {/* Primary Action Button: TẢI ẢNH & SỬA THIỆP NGAY */}
            <button
              onClick={() => onUseTemplate(template)}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all font-display text-sm"
            >
              <Upload className="w-4 h-4 text-neutral-900" />
              <span>Tải ảnh &amp; Sửa thiệp ngay</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(template.id)}
                className={`flex-1 py-2.5 px-3 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                  isFavorite
                    ? 'bg-neutral-800 border-neutral-600 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : ''}`} />
                <span>{isFavorite ? 'Đã lưu thích' : 'Yêu thích'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Chia sẻ link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
