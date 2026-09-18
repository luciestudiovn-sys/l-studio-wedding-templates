import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X, Check, Calendar, MapPin, Music, Copy, Wand2, Bot,
  CreditCard, Clock, Upload, Image as ImageIcon, Trash2, Download,
  Palette, FileAudio, RefreshCw, Sparkles, ExternalLink,
  Layers, CheckCircle2, Share2, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { Template, CoupleInfo } from '../types/template';
import { getAssetUrl } from '../utils/formatters';
import { buildInvitationUrl } from '../utils/share';

interface QuickEditorModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveInvitation?: (template: Template, coupleInfo: CoupleInfo, photoPlacement: PhotoPlacement) => void;
}

export type PhotoPlacement = 'arch' | 'circle' | 'rounded' | 'hero';

const AI_MESSAGE_PRESETS = [
  {
    tone: 'Lãng mạn',
    msg: (g: string, b: string) =>
      `Khoảnh khắc ${g || 'chú rể'} và ${b || 'cô dâu'} hòa chung nhịp đập, chúng mình vô cùng hạnh phúc khi được cùng người thương bước vào lễ đường. Rất mong được đón tiếp bạn trong ngày vui trọng đại!`,
  },
  {
    tone: 'Trang trọng',
    msg: () =>
      `Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi tại lễ thành hôn. Sự hiện diện và lời chúc phúc của quý vị là niềm vinh hạnh lớn lao nhất cho hai gia đình!`,
  },
  {
    tone: 'Tối giản & Tinh tế',
    msg: () =>
      `Một chặng đường mới mở ra với tình yêu và sự đồng hành. Chúng tôi chân thành mời bạn đến chứng kiến khoảnh khắc đặc biệt và sẻ chia niềm hạnh phúc bình dị này.`,
  },
  {
    tone: 'Thân mật & Vui tươi',
    msg: () =>
      `Sau bao ngày cùng nhau vượt qua bao thăng trầm, chúng mình chính thức về chung một nhà! Hãy đến nâng ly chúc mừng và chia sẻ niềm vui này cùng chúng mình nhé!`,
  },
];

const POPULAR_BANKS = [
  { code: 'vietcombank', name: 'Vietcombank' },
  { code: 'techcombank', name: 'Techcombank' },
  { code: 'mbbank', name: 'MB Bank' },
  { code: 'acb', name: 'ACB' },
  { code: 'vpbank', name: 'VPBank' },
  { code: 'tpbank', name: 'TPBank' },
  { code: 'bidv', name: 'BIDV' },
];

const COLOR_THEMES = [
  { id: 'neutral', name: 'Đen Trắng Tối Giản', bg: 'bg-neutral-900', text: 'text-neutral-900', border: 'border-neutral-900' },
  { id: 'rose', name: 'Hồng Pastel Nhẹ', bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-300' },
  { id: 'gold', name: 'Vàng Champagne', bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-300' },
  { id: 'emerald', name: 'Xanh Sage Tự Nhiên', bg: 'bg-emerald-700', text: 'text-emerald-700', border: 'border-emerald-300' },
  { id: 'burgundy', name: 'Đỏ Rượu Sang Trọng', bg: 'bg-red-800', text: 'text-red-800', border: 'border-red-300' },
];

type EditorTab = 'photo' | 'info' | 'message' | 'music_qr' | 'style';

export const QuickEditorModal: React.FC<QuickEditorModalProps> = ({
  template,
  isOpen,
  onClose,
  onOpenLiveInvitation,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('photo');
  const [photoPlacement, setPhotoPlacement] = useState<PhotoPlacement>('arch');
  const [photoZoom, setPhotoZoom] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<'card' | 'scroll'>('card');
  const cardPreviewRef = useRef<HTMLDivElement | null>(null);

  // Share Dialog state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [publicShareUrl, setPublicShareUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo>({
    groomName: 'Nguyễn Hoàng Nam',
    brideName: 'Trần Mai Linh',
    weddingDate: '2026-10-25',
    weddingTime: '11:30',
    lunarDate: '15 tháng 09 năm Bính Ngọ',
    venueName: 'Trung Tâm Tiệc Cưới White Palace',
    venueAddress: '194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh',
    invitationMessage: 'Sự hiện diện của quý khách là niềm vinh hạnh lớn nhất cho gia đình chúng tôi!',
    coverImage: '',
    themeColor: 'neutral',
    fontFamilyChoice: 'sans',
    bankName: 'vietcombank',
    bankAccount: '9988776655',
    bankOwner: 'NGUYEN HOANG NAM',
    customSong: '',
    customAudioUrl: '',
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [aiToneSelected, setAiToneSelected] = useState<string>('');

  // When modal opens or template changes, load any cached customization
  useEffect(() => {
    if (template && isOpen) {
      try {
        const saved = localStorage.getItem(`l_studio_invite_${template.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.coupleInfo) {
            setCoupleInfo((prev) => ({ ...prev, ...parsed.coupleInfo }));
          }
          if (parsed.photoPlacement) {
            setPhotoPlacement(parsed.photoPlacement);
          }
        }
      } catch (e) {
        console.warn('Could not read cached invitation', e);
      }
    }
  }, [template, isOpen]);

  // Handle local image upload from user device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh nhỏ hơn 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoupleInfo((prev) => ({
            ...prev,
            coverImage: event.target?.result as string,
          }));
          setImageUrlInput('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle external image URL input
  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      setCoupleInfo((prev) => ({
        ...prev,
        coverImage: imageUrlInput.trim(),
      }));
    }
  };

  // Reset to template's original model photo
  const handleResetToTemplatePhoto = () => {
    setCoupleInfo((prev) => ({
      ...prev,
      coverImage: '',
    }));
    setImageUrlInput('');
  };

  // Handle custom audio file upload (MP3)
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoupleInfo((prev) => ({
        ...prev,
        customSong: file.name.replace(/\.[^/.]+$/, ''),
        customAudioUrl: url,
      }));
    }
  };

  // Calculate days remaining to wedding date
  const daysRemaining = useMemo(() => {
    if (!coupleInfo.weddingDate) return null;
    const target = new Date(coupleInfo.weddingDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [coupleInfo.weddingDate]);

  if (!isOpen || !template) return null;

  // Generate public viewing link (NOT localhost!)
  const handleShare = () => {
    const shareUrl = buildInvitationUrl(template, coupleInfo, photoPlacement);
    setPublicShareUrl(shareUrl);

    // Generate QR code for mobile scanning
    QRCode.toDataURL(shareUrl, { width: 260, margin: 2, color: { dark: '#111827', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(console.error);

    // Copy immediately to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }).catch(() => {});

    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
    });

    setShareModalOpen(true);
  };

  const handleCopyLinkAgain = () => {
    if (publicShareUrl) {
      navigator.clipboard.writeText(publicShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenLiveTab = () => {
    if (publicShareUrl) {
      window.open(publicShareUrl, '_blank');
    }
  };

  const handleDownloadImage = async () => {
    if (!cardPreviewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardPreviewRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `thiep-cuoi-${template.slug}-${coupleInfo.groomName}-${coupleInfo.brideName}.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 70, spread: 60 });
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Không thể tạo ảnh thiệp lúc này, vui lòng thử lại');
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyAiPreset = (preset: typeof AI_MESSAGE_PRESETS[0]) => {
    const generated = preset.msg(coupleInfo.groomName, coupleInfo.brideName);
    setCoupleInfo((prev) => ({ ...prev, invitationMessage: generated }));
    setAiToneSelected(preset.tone);
  };

  const defaultImgUrl = getAssetUrl(template.longThumbnail || template.thumbnail);
  const displayCoverImg = coupleInfo.coverImage || defaultImgUrl;

  const vietQrUrl = coupleInfo.bankAccount
    ? `https://img.vietqr.io/image/${coupleInfo.bankName || 'vietcombank'}-${coupleInfo.bankAccount}-compact.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(
        coupleInfo.groomName || 'chu re'
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-auto max-h-[95vh] border border-neutral-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ============================================================ */}
        {/* LEFT COLUMN: Tools & Customizer Options                      */}
        {/* ============================================================ */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-neutral-200 overflow-hidden bg-white">
          {/* Header */}
          <div className="p-4 sm:p-5 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider font-bold">
                L-STUDIO EDITOR
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Mẫu: <strong className="text-neutral-900">{template.templateName}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold font-display text-neutral-900">
              Chỉnh Sửa Thiệp Cưới Theo Mẫu
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tải ảnh dâu rể, cá nhân hoá thông tin, tạo mã VietQR và sinh link mời công khai
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-200 px-3 bg-neutral-50 text-xs overflow-x-auto gap-1 py-1.5">
            <button
              onClick={() => setActiveTab('photo')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'photo'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Ảnh dâu rể</span>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Thông tin lễ cưới</span>
            </button>
            <button
              onClick={() => setActiveTab('message')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'message'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Lời mời cưới</span>
            </button>
            <button
              onClick={() => setActiveTab('music_qr')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'music_qr'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>VietQR &amp; Nhạc</span>
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'style'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tông màu</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[56vh] lg:max-h-[60vh]">
            {/* TAB 1: PHOTO & FRAMING */}
            {activeTab === 'photo' && (
              <div className="space-y-4 animate-fade-in">
                {/* Upload Section */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Tải ảnh cưới của bạn lên mẫu</span>
                    </span>
                    {coupleInfo.coverImage && (
                      <button
                        onClick={handleResetToTemplatePhoto}
                        className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Dùng ảnh mẫu gốc</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium cursor-pointer shadow-sm transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy (JPG, PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Or image URL input */}
                  <div className="pt-2 border-t border-neutral-200/80">
                    <label className="block text-[11px] text-neutral-500 mb-1 font-medium">
                      Hoặc dán trực tiếp đường link ảnh (Imgur, Facebook, Cloudinary...):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://example.com/anh-cuoi.jpg"
                        className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleApplyImageUrl}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>

                {/* Frame Style Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Kiểu lồng khung ảnh trên thiệp</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'arch', label: 'Khung vòm Hàn Quốc (Arch)', desc: 'Cắt vòm sang trọng' },
                      { id: 'rounded', label: 'Khung bo góc mềm (Rounded)', desc: 'Hiện đại, sắc nét' },
                      { id: 'circle', label: 'Khung tròn cổ điển (Circle)', desc: 'Huy hiệu tình yêu' },
                      { id: 'hero', label: 'Ảnh tràn nền (Hero Full)', desc: 'Bao trọn tấm thiệp' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPhotoPlacement(opt.id as PhotoPlacement)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          photoPlacement === opt.id
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                        }`}
                      >
                        <span className="block text-xs font-semibold">{opt.label}</span>
                        <span className={`text-[10px] block mt-0.5 ${photoPlacement === opt.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom control */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-700">Tỷ lệ thu phóng ảnh</span>
                    <span className="font-mono text-neutral-500">{Math.round(photoZoom * 100)}%</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 1.15, 1.3].map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setPhotoZoom(z)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                          photoZoom === z
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {z === 1 ? 'Chuẩn (100%)' : z === 1.15 ? 'Vừa (115%)' : 'Lớn (130%)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('info')}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-xl text-xs sm:text-sm transition-all"
                  >
                    Tiếp tục: Chỉnh thông tin lễ cưới &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: WEDDING INFORMATION */}
            {activeTab === 'info' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Họ &amp; Tên Chú Rể *
                    </label>
                    <input
                      type="text"
                      value={coupleInfo.groomName}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, groomName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                      placeholder="Nguyễn Hoàng Nam"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Họ &amp; Tên Cô Dâu *
                    </label>
                    <input
                      type="text"
                      value={coupleInfo.brideName}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, brideName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                      placeholder="Trần Mai Linh"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Ngày tổ chức (Dương lịch)</span>
                    </label>
                    <input
                      type="date"
                      value={coupleInfo.weddingDate}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingDate: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-mono focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Giờ làm lễ</span>
                    </label>
                    <input
                      type="time"
                      value={coupleInfo.weddingTime}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingTime: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-mono focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Ngày Âm lịch (hiển thị thêm)
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.lunarDate || ''}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, lunarDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                    placeholder="15 tháng 09 năm Bính Ngọ"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Tên địa điểm / Trung tâm tiệc cưới *</span>
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.venueName}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, venueName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                    placeholder="Trung Tâm Tiệc Cưới White Palace"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Địa chỉ chi tiết (hỗ trợ chỉ đường Google Maps)
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.venueAddress}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, venueAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                    placeholder="194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP.HCM"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('message')}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-xl text-xs sm:text-sm transition-all"
                  >
                    Tiếp tục: Lời mời cưới &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: INVITATION MESSAGE & AI */}
            {activeTab === 'message' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">
                    Gợi ý lời ngỏ bằng AI theo văn phong:
                  </label>
                  <span className="text-[10px] text-amber-600 font-mono flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    <span>L-Studio AI</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {AI_MESSAGE_PRESETS.map((p) => (
                    <button
                      key={p.tone}
                      type="button"
                      onClick={() => handleApplyAiPreset(p)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center gap-1.5 transition-all ${
                        aiToneSelected === p.tone
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      <Wand2 className="w-3 h-3 text-amber-400" />
                      <span>{p.tone}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={coupleInfo.invitationMessage}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, invitationMessage: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm leading-relaxed focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                  placeholder="Nhập lời mời cưới của bạn..."
                />

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('music_qr')}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-xl text-xs sm:text-sm transition-all"
                  >
                    Tiếp tục: Cài đặt VietQR &amp; Nhạc cưới &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: VIETQR & MUSIC */}
            {activeTab === 'music_qr' && (
              <div className="space-y-4 animate-fade-in">
                {/* VietQR Bank Settings */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                  <h4 className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Hộp mừng cưới số (Mã VietQR chuyển khoản)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-0.5">Ngân hàng</label>
                      <select
                        value={coupleInfo.bankName}
                        onChange={(e) => setCoupleInfo({ ...coupleInfo, bankName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                      >
                        {POPULAR_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-0.5">Số tài khoản</label>
                      <input
                        type="text"
                        value={coupleInfo.bankAccount}
                        onChange={(e) => setCoupleInfo({ ...coupleInfo, bankAccount: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-mono"
                        placeholder="Số tài khoản..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-0.5">Chủ tài khoản</label>
                      <input
                        type="text"
                        value={coupleInfo.bankOwner}
                        onChange={(e) => setCoupleInfo({ ...coupleInfo, bankOwner: e.target.value.toUpperCase() })}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs uppercase font-mono"
                        placeholder="Tên chủ thẻ..."
                      />
                    </div>
                  </div>
                </div>

                {/* Music settings */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                  <h4 className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Nhạc nền đám cưới (MP3)</span>
                  </h4>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600">
                      Bài hát hiện tại: <strong>{coupleInfo.customSong || template.audioTitle || 'Marry You'}</strong>
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                    <FileAudio className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Tải file nhạc MP3 từ máy của bạn</span>
                    <input
                      type="file"
                      accept="audio/mp3,audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: STYLE & COLOR */}
            {activeTab === 'style' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    Chọn tông màu chủ đạo cho thiệp
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COLOR_THEMES.map((theme) => {
                      const isSelected = coupleInfo.themeColor === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setCoupleInfo({ ...coupleInfo, themeColor: theme.id })}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.bg} border border-white/40`} />
                          <span className="text-xs font-medium">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions Bar */}
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 flex items-center gap-2.5">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex-1 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-semibold py-2.5 px-3 rounded-xl shadow-subtle flex items-center justify-center gap-1.5 transition-all text-xs font-display disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-700" />
                  <span>Đang xuất ảnh thiệp...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-neutral-800" />
                  <span>Tải ảnh thiệp HD (PNG)</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 px-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs font-display"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Tạo link mời cưới &rarr;</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Live Template Canvas Preview                   */}
        {/* ============================================================ */}
        <div className="w-full lg:w-1/2 bg-neutral-100 p-4 sm:p-6 flex flex-col items-center justify-center overflow-y-auto">
          {/* Header Bar */}
          <div className="w-full max-w-[320px] flex items-center justify-between mb-3 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>MẪU THIỆP THỰC TẾ</span>
            </span>

            {/* Toggle Preview Mode */}
            <div className="flex bg-neutral-200 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setPreviewMode('card')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  previewMode === 'card' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Khung thiệp HD
              </button>
              <button
                onClick={() => setPreviewMode('scroll')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  previewMode === 'scroll' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Mẫu cuộn dài
              </button>
            </div>
          </div>

          {/* Renderable Wedding Card Canvas (Used for HTML-to-Image capture) */}
          <div
            ref={cardPreviewRef}
            className="w-[320px] bg-white rounded-3xl shadow-2xl border border-neutral-300 overflow-hidden relative text-neutral-900 flex flex-col select-none transition-all"
          >
            {/* Template Art Style Accent Banner */}
            <div className="relative bg-neutral-50 p-4 pb-2 text-center border-b border-neutral-100">
              <div className="inline-block px-2 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[9px] uppercase tracking-wider mb-2">
                {template.templateName} &bull; L-STUDIO
              </div>

              {/* Monogram */}
              <div className="text-2xl font-display font-bold text-neutral-900 tracking-tight">
                {coupleInfo.groomName || 'Chú rể'}
                <span className="text-neutral-400 font-serif font-light text-base mx-1.5">&amp;</span>
                {coupleInfo.brideName || 'Cô dâu'}
              </div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-0.5">
                SAVE THE DATE &bull; THÀNH HÔN
              </p>

              {/* Countdown badge */}
              {daysRemaining !== null && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-neutral-900/80 backdrop-blur-sm text-white text-[9px] font-mono">
                  Còn {daysRemaining} ngày
                </div>
              )}
            </div>

            {/* Couple Photo styled directly on template */}
            <div className="relative bg-neutral-100 overflow-hidden flex items-center justify-center p-3.5">
              {photoPlacement === 'arch' ? (
                <div className="w-56 h-72 rounded-t-full rounded-b-xl overflow-hidden shadow-md border-4 border-white relative bg-white">
                  <img
                    src={displayCoverImg}
                    alt="Ảnh dâu rể"
                    crossOrigin="anonymous"
                    style={{ transform: `scale(${photoZoom})` }}
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                  />
                </div>
              ) : photoPlacement === 'circle' ? (
                <div className="w-52 h-52 rounded-full overflow-hidden shadow-md border-4 border-white relative bg-white">
                  <img
                    src={displayCoverImg}
                    alt="Ảnh dâu rể"
                    crossOrigin="anonymous"
                    style={{ transform: `scale(${photoZoom})` }}
                    className="w-full h-full object-cover object-center transition-transform duration-300"
                  />
                </div>
              ) : photoPlacement === 'rounded' ? (
                <div className="w-full h-64 rounded-2xl overflow-hidden shadow-md border-2 border-white relative bg-white">
                  <img
                    src={displayCoverImg}
                    alt="Ảnh dâu rể"
                    crossOrigin="anonymous"
                    style={{ transform: `scale(${photoZoom})` }}
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                  />
                </div>
              ) : (
                /* Hero Full */
                <div className="w-full h-64 overflow-hidden relative">
                  <img
                    src={displayCoverImg}
                    alt="Ảnh dâu rể"
                    crossOrigin="anonymous"
                    style={{ transform: `scale(${photoZoom})` }}
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              )}
            </div>

            {/* Event Details on Card */}
            <div className="p-4 text-center space-y-2.5 bg-white text-xs">
              <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 text-[11px] font-mono font-semibold">
                {coupleInfo.weddingTime} &bull; {coupleInfo.weddingDate}
              </div>

              {coupleInfo.lunarDate && (
                <p className="text-[10px] text-neutral-500 font-serif italic -mt-1">
                  (Âm lịch: {coupleInfo.lunarDate})
                </p>
              )}

              <div>
                <p className="font-bold text-neutral-900 text-xs font-display">
                  {coupleInfo.venueName}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1 font-sans">
                  {coupleInfo.venueAddress}
                </p>
              </div>

              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] italic text-neutral-600 leading-relaxed font-serif">
                &ldquo;{coupleInfo.invitationMessage}&rdquo;
              </div>

              {/* VietQR Bank simulation */}
              {coupleInfo.bankAccount && (
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-left px-1">
                  <div className="text-[10px]">
                    <span className="block font-semibold text-neutral-800">Mừng cưới số (VietQR)</span>
                    <span className="font-mono text-neutral-500">
                      {coupleInfo.bankAccount} ({coupleInfo.bankName?.toUpperCase()})
                    </span>
                  </div>
                  {vietQrUrl && (
                    <img
                      src={vietQrUrl}
                      alt="VietQR"
                      crossOrigin="anonymous"
                      className="w-10 h-10 object-contain rounded border border-neutral-200"
                    />
                  )}
                </div>
              )}

              <div className="pt-1 text-[9px] text-neutral-400 font-mono tracking-wider flex items-center justify-center gap-1">
                <span>THIỆP CƯỚI THIẾT KẾ BỞI L-STUDIO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUCCESS MODAL: PUBLIC INVITATION LINK & QR CODE               */}
      {/* ============================================================ */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 border border-neutral-200 animate-scale-up">
            <button
              onClick={() => setShareModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold font-display text-neutral-900">
                Link Thiệp Mời Của Bạn Đã Sẵn Sàng!
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Đường link đã được tạo công khai. Bạn có thể gửi cho bạn bè qua Zalo, Messenger hoặc mở xem thử ngay:
              </p>
            </div>

            {/* Scannable QR Code */}
            {qrDataUrl && (
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 inline-block mx-auto shadow-xs">
                <img
                  src={qrDataUrl}
                  alt="Mã QR Thiệp Mời"
                  className="w-44 h-44 object-contain mx-auto"
                />
                <span className="block text-[10px] text-neutral-400 font-mono mt-1">
                  Quét bằng camera điện thoại để xem trực tiếp
                </span>
              </div>
            )}

            {/* URL input with 1-click copy */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-left">
              <input
                type="text"
                readOnly
                value={publicShareUrl}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs font-mono text-neutral-700 outline-none select-all truncate"
              />
              <button
                onClick={handleCopyLinkAgain}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã chép!' : 'Chép'}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleOpenLiveTab}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở xem trang thiệp mời ngay (Tab mới)</span>
              </button>

              {onOpenLiveInvitation && (
                <button
                  onClick={() => {
                    setShareModalOpen(false);
                    onClose();
                    onOpenLiveInvitation(template, coupleInfo, photoPlacement);
                  }}
                  className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Xem giao diện khách mời trực tiếp trong trang</span>
                </button>
              )}

              <button
                onClick={() => setShareModalOpen(false)}
                className="w-full py-2 bg-transparent hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 font-medium rounded-xl text-xs transition-colors"
              >
                Đóng &amp; Tiếp tục chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
