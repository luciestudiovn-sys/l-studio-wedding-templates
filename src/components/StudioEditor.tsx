import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft, Eye, Download, Share2, Volume2, VolumeX,
  Upload, Image as ImageIcon, Trash2, Calendar, Clock, MapPin,
  CreditCard, Wand2, Bot, Palette, FileAudio, Check, Copy,
  CheckCircle2, ExternalLink, Sparkles, ChevronDown,
  Layers, RefreshCw, X, Music
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { Template, CoupleInfo } from '../types/template';
import { getAssetUrl, getAudioUrl } from '../utils/formatters';
import { buildInvitationUrl } from '../utils/share';

export type PhotoPlacement = 'arch' | 'circle' | 'rounded' | 'hero';
export type PhoneDisplayMode = 'live' | 'poster' | 'customized';

interface StudioEditorProps {
  template: Template;
  allTemplates: Template[];
  onBack: () => void;
  onPreviewLive: (template: Template, info: CoupleInfo, placement: PhotoPlacement) => void;
  onSelectTemplate: (template: Template) => void;
}

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

type EditorSection = 'photo' | 'couple' | 'event' | 'message' | 'vietqr' | 'style';

export const StudioEditor: React.FC<StudioEditorProps> = ({
  template,
  allTemplates,
  onBack,
  onPreviewLive,
  onSelectTemplate,
}) => {
  const [activeSection, setActiveSection] = useState<EditorSection>('photo');
  const [photoPlacement, setPhotoPlacement] = useState<PhotoPlacement>('arch');
  const [photoZoom, setPhotoZoom] = useState<number>(1);
  const [canvasScale, setCanvasScale] = useState<number>(1);
  const [displayMode, setDisplayMode] = useState<PhoneDisplayMode>('live');

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phoneCaptureRef = useRef<HTMLDivElement | null>(null);

  // Template switcher dropdown
  const [isSwitchingTemplate, setIsSwitchingTemplate] = useState<boolean>(false);

  // Export & Share State
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [publicShareUrl, setPublicShareUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Couple Information State
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

  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [aiToneSelected, setAiToneSelected] = useState<string>('');

  // Load cached invitation data if exists
  useEffect(() => {
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
      console.warn('Could not load cached invitation', e);
    }
  }, [template.id]);

  // Audio Playback
  const currentAudioSrc = coupleInfo.customAudioUrl || getAudioUrl(template.audioKey);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => console.warn('Audio play error', e));
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh nhỏ hơn 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCoupleInfo((prev) => ({ ...prev, coverImage: ev.target?.result as string }));
          setImageUrlInput('');
          // Switch to customized mode so user sees their uploaded image immediately
          setDisplayMode('customized');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      setCoupleInfo((prev) => ({ ...prev, coverImage: imageUrlInput.trim() }));
      setDisplayMode('customized');
    }
  };

  const handleResetToTemplatePhoto = () => {
    setCoupleInfo((prev) => ({ ...prev, coverImage: '' }));
    setImageUrlInput('');
  };

  // Handle MP3 Upload
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

  // Wedding Countdown
  const daysRemaining = useMemo(() => {
    if (!coupleInfo.weddingDate) return null;
    const target = new Date(coupleInfo.weddingDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [coupleInfo.weddingDate]);

  // Publish & Share
  const handlePublishAndShare = () => {
    const shareUrl = buildInvitationUrl(template, coupleInfo, photoPlacement);
    setPublicShareUrl(shareUrl);

    QRCode.toDataURL(shareUrl, { width: 260, margin: 2, color: { dark: '#111827', light: '#ffffff' } })
      .then(setQrCodeDataUrl)
      .catch(console.error);

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }).catch(() => {});

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });

    setShareModalOpen(true);
  };

  const handleCopyLink = () => {
    if (publicShareUrl) {
      navigator.clipboard.writeText(publicShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Export HD PNG
  const handleExportPng = async () => {
    if (displayMode === 'live') {
      alert('Vui lòng chuyển sang tab "Bản vẽ dọc (Poster HD)" hoặc "Lồng ảnh & Dâu rể" để xuất ảnh PNG chất lượng cao');
      setDisplayMode('poster');
      return;
    }
    if (!phoneCaptureRef.current) return;
    setIsExportingPng(true);
    try {
      const dataUrl = await toPng(phoneCaptureRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `thiep-cuoi-${template.slug}-${coupleInfo.groomName}-${coupleInfo.brideName}.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 60, spread: 50 });
    } catch (err) {
      console.error('Export PNG failed', err);
      alert('Không thể tạo ảnh thiệp, vui lòng thử lại');
    } finally {
      setIsExportingPng(false);
    }
  };

  const templateCoverImg = getAssetUrl(template.longThumbnail || template.thumbnail);
  const displayPhoto = coupleInfo.coverImage || templateCoverImg;

  const vietQrUrl = coupleInfo.bankAccount
    ? `https://img.vietqr.io/image/${coupleInfo.bankName || 'vietcombank'}-${coupleInfo.bankAccount}-compact.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(
        `${coupleInfo.groomName} ${coupleInfo.brideName}`
      )}`
    : '';

  // Original interactive template URL
  const cineloveIframeSrc = `https://cinelove.me/template/iframe/${template.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1115] text-neutral-100 font-sans select-none overflow-hidden">
      {/* Hidden Audio */}
      <audio ref={audioRef} src={currentAudioSrc} loop preload="auto" />

      {/* ============================================================ */}
      {/* 1. TOP STUDIO NAVBAR                                         */}
      {/* ============================================================ */}
      <header className="h-14 bg-[#161922] border-b border-neutral-800 px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Exit button & Template info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát Studio</span>
          </button>

          <div className="h-4 w-px bg-neutral-700 hidden sm:block" />

          {/* Template Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSwitchingTemplate(!isSwitchingTemplate)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/60 text-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold truncate max-w-[180px]">{template.templateName}</span>
              <span className="text-[10px] text-neutral-400 font-mono hidden md:inline">({template.slug})</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* Template picker popover */}
            {isSwitchingTemplate && (
              <div className="absolute top-11 left-0 w-80 max-h-96 bg-[#1a1d26] border border-neutral-700 rounded-2xl shadow-2xl p-2.5 z-50 overflow-y-auto space-y-1 preview-scrollbar">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold">
                    Chọn đúng mẫu để sửa ({allTemplates.length} mẫu)
                  </span>
                  <button onClick={() => setIsSwitchingTemplate(false)} className="text-neutral-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {allTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTemplate(t);
                      setIsSwitchingTemplate(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                      t.id === template.id ? 'bg-neutral-700 text-white' : 'hover:bg-neutral-800/80 text-neutral-300'
                    }`}
                  >
                    <img
                      src={getAssetUrl(t.thumbnail)}
                      alt={t.templateName}
                      className="w-10 h-12 object-cover rounded-md shrink-0 border border-neutral-600 bg-neutral-900"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-white">{t.templateName}</p>
                      <p className="text-[10px] text-neutral-400 font-mono truncate">{t.slug}</p>
                      <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                        {t.audioTitle || 'Marry You'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Audio Player & Viewport Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Music button */}
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              isPlayingAudio
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="truncate max-w-[120px]">{coupleInfo.customSong || template.audioTitle || 'Marry You'}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Bật nhạc nền</span>
              </>
            )}
          </button>

          {/* Canvas Zoom */}
          <div className="flex items-center bg-neutral-800/80 rounded-lg p-0.5 border border-neutral-700/60 text-xs">
            {[0.85, 1, 1.15].map((s) => (
              <button
                key={s}
                onClick={() => setCanvasScale(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  canvasScale === s ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {Math.round(s * 100)}%
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Download PNG Button */}
          <button
            onClick={handleExportPng}
            disabled={isExportingPng}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition-colors disabled:opacity-50"
            title="Tải ảnh thiệp PNG 2.5x HD"
          >
            {isExportingPng ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExportingPng ? 'Đang xuất...' : 'Xuất PNG'}</span>
          </button>

          {/* Preview Live Button */}
          <button
            onClick={() => onPreviewLive(template, coupleInfo, photoPlacement)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Xem trước khách</span>
          </button>

          {/* Publish & Share Button */}
          <button
            onClick={handlePublishAndShare}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all font-display"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Xuất bản &amp; Lấy link</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE: LEFT PANEL + CENTER PHONE CANVAS          */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT TOOLBOX PANEL */}
        <aside className="w-full lg:w-[420px] bg-[#141720] border-r border-neutral-800/80 flex flex-col shrink-0 z-20 max-h-[42vh] lg:max-h-full">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-neutral-800 bg-[#11131a] px-3 py-2 gap-1 overflow-x-auto text-xs shrink-0 preview-scrollbar">
            {[
              { id: 'photo', label: 'Ảnh cưới', icon: ImageIcon },
              { id: 'couple', label: 'Dâu rể', icon: Sparkles },
              { id: 'event', label: 'Hôn lễ', icon: Calendar },
              { id: 'message', label: 'Lời ngỏ', icon: Wand2 },
              { id: 'vietqr', label: 'VietQR', icon: CreditCard },
              { id: 'style', label: 'Cài đặt', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as EditorSection)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold border border-neutral-700/60'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Detail Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 preview-scrollbar text-xs">
            {/* SECTION 1: PHOTO & FRAMING */}
            {activeSection === 'photo' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3.5 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Tải ảnh cưới của bạn</span>
                    </span>
                    {coupleInfo.coverImage && (
                      <button
                        onClick={handleResetToTemplatePhoto}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Dùng ảnh mẫu gốc</span>
                      </button>
                    )}
                  </div>

                  <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium cursor-pointer border border-neutral-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chọn ảnh từ máy (JPG, PNG, WEBP)</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  <div className="pt-2 border-t border-neutral-800">
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Hoặc dán đường link ảnh trực tuyến:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://i.imgur.com/anh-cuoi.jpg"
                        className="flex-1 px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        onClick={handleApplyImageUrl}
                        className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-medium"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>

                {/* Framing placement options */}
                <div className="space-y-2">
                  <label className="block font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kiểu lồng khung ảnh lên mẫu thiệp</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'arch', label: 'Vòm Hàn Quốc (Arch)', desc: 'Cắt vòm cong sang trọng' },
                      { id: 'rounded', label: 'Bo góc mềm (Rounded)', desc: 'Hiện đại, thanh lịch' },
                      { id: 'circle', label: 'Khung tròn (Circle)', desc: 'Huy hiệu tình yêu' },
                      { id: 'hero', label: 'Tràn viền (Hero Full)', desc: 'Bao trọn khung bìa' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setPhotoPlacement(opt.id as PhotoPlacement);
                          setDisplayMode('customized');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          photoPlacement === opt.id
                            ? 'bg-neutral-800 border-amber-500/80 text-white shadow-sm'
                            : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/50 text-neutral-400'
                        }`}
                      >
                        <span className="block font-semibold text-xs text-neutral-200">{opt.label}</span>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom control */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Thu phóng ảnh dâu rể</span>
                    <span className="font-mono text-amber-400">{Math.round(photoZoom * 100)}%</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 1.15, 1.3].map((z) => (
                      <button
                        key={z}
                        onClick={() => {
                          setPhotoZoom(z);
                          setDisplayMode('customized');
                        }}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                          photoZoom === z
                            ? 'bg-neutral-800 border-amber-500/80 text-white font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        {z === 1 ? '100%' : z === 1.15 ? '115%' : '130%'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: BRIDE & GROOM */}
            {activeSection === 'couple' && (
              <div className="space-y-3.5 animate-fade-in">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Họ &amp; Tên Chú Rể *
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.groomName}
                    onChange={(e) => {
                      setCoupleInfo({ ...coupleInfo, groomName: e.target.value });
                      setDisplayMode('customized');
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 font-medium focus:ring-1 focus:ring-amber-500"
                    placeholder="Nguyễn Hoàng Nam"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Họ &amp; Tên Cô Dâu *
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.brideName}
                    onChange={(e) => {
                      setCoupleInfo({ ...coupleInfo, brideName: e.target.value });
                      setDisplayMode('customized');
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 font-medium focus:ring-1 focus:ring-amber-500"
                    placeholder="Trần Mai Linh"
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: WEDDING SCHEDULE & VENUE */}
            {activeSection === 'event' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Ngày Dương lịch
                    </label>
                    <input
                      type="date"
                      value={coupleInfo.weddingDate}
                      onChange={(e) => {
                        setCoupleInfo({ ...coupleInfo, weddingDate: e.target.value });
                        setDisplayMode('customized');
                      }}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 font-mono focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" /> Giờ làm lễ
                    </label>
                    <input
                      type="time"
                      value={coupleInfo.weddingTime}
                      onChange={(e) => {
                        setCoupleInfo({ ...coupleInfo, weddingTime: e.target.value });
                        setDisplayMode('customized');
                      }}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 font-mono focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Ngày Âm lịch (hiển thị kèm)
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.lunarDate || ''}
                    onChange={(e) => {
                      setCoupleInfo({ ...coupleInfo, lunarDate: e.target.value });
                      setDisplayMode('customized');
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:ring-1 focus:ring-amber-500"
                    placeholder="15 tháng 09 năm Bính Ngọ"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Tên trung tâm tiệc cưới
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.venueName}
                    onChange={(e) => {
                      setCoupleInfo({ ...coupleInfo, venueName: e.target.value });
                      setDisplayMode('customized');
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:ring-1 focus:ring-amber-500"
                    placeholder="Trung Tâm Tiệc Cưới White Palace"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Địa chỉ chi tiết (hỗ trợ chỉ đường Google Maps)
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.venueAddress}
                    onChange={(e) => {
                      setCoupleInfo({ ...coupleInfo, venueAddress: e.target.value });
                      setDisplayMode('customized');
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:ring-1 focus:ring-amber-500"
                    placeholder="194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP.HCM"
                  />
                </div>
              </div>
            )}

            {/* SECTION 4: INVITATION MESSAGE & AI */}
            {activeSection === 'message' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300 font-semibold">Gợi ý câu từ bằng AI:</span>
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <Bot className="w-3 h-3" /> L-Studio AI
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {AI_MESSAGE_PRESETS.map((p) => (
                    <button
                      key={p.tone}
                      type="button"
                      onClick={() => {
                        const text = p.msg(coupleInfo.groomName, coupleInfo.brideName);
                        setCoupleInfo({ ...coupleInfo, invitationMessage: text });
                        setAiToneSelected(p.tone);
                        setDisplayMode('customized');
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        aiToneSelected === p.tone
                          ? 'bg-neutral-800 border-amber-500/80 text-white shadow-xs'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800/40'
                      }`}
                    >
                      <span className="font-semibold block text-neutral-200">{p.tone}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={coupleInfo.invitationMessage}
                  onChange={(e) => {
                    setCoupleInfo({ ...coupleInfo, invitationMessage: e.target.value });
                    setDisplayMode('customized');
                  }}
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 leading-relaxed focus:ring-1 focus:ring-amber-500"
                  placeholder="Nhập thư ngỏ gửi khách mời..."
                />
              </div>
            )}

            {/* SECTION 5: VIETQR GIFT BOX */}
            {activeSection === 'vietqr' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
                  <span className="font-semibold text-neutral-200 block">
                    Cài đặt Hộp mừng cưới số (VietQR)
                  </span>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Ngân hàng</label>
                    <select
                      value={coupleInfo.bankName}
                      onChange={(e) => {
                        setCoupleInfo({ ...coupleInfo, bankName: e.target.value });
                        setDisplayMode('customized');
                      }}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100"
                    >
                      {POPULAR_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      value={coupleInfo.bankAccount}
                      onChange={(e) => {
                        setCoupleInfo({ ...coupleInfo, bankAccount: e.target.value });
                        setDisplayMode('customized');
                      }}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 font-mono"
                      placeholder="Số tài khoản..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Tên chủ tài khoản</label>
                    <input
                      type="text"
                      value={coupleInfo.bankOwner}
                      onChange={(e) => {
                        setCoupleInfo({ ...coupleInfo, bankOwner: e.target.value.toUpperCase() });
                        setDisplayMode('customized');
                      }}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 uppercase font-mono"
                      placeholder="NGUYEN HOANG NAM"
                    />
                  </div>
                </div>

                {/* QR Preview pill */}
                {vietQrUrl && (
                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-center flex items-center justify-between">
                    <span className="text-neutral-400 text-[11px]">Mã VietQR tự sinh</span>
                    <img src={vietQrUrl} alt="VietQR" className="w-12 h-12 object-contain rounded bg-white p-0.5" />
                  </div>
                )}
              </div>
            )}

            {/* SECTION 6: STYLE & MUSIC */}
            {activeSection === 'style' && (
              <div className="space-y-4 animate-fade-in">
                {/* Theme Palette */}
                <div className="space-y-2">
                  <label className="block font-semibold text-neutral-300">Tông màu chủ đạo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_THEMES.map((theme) => {
                      const isSelected = coupleInfo.themeColor === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setCoupleInfo({ ...coupleInfo, themeColor: theme.id });
                            setDisplayMode('customized');
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-neutral-800 border-amber-500 text-white shadow-xs'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800/50'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.bg} border border-white/40`} />
                          <span className="text-xs font-medium text-neutral-200">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Audio MP3 */}
                <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                  <span className="font-semibold text-neutral-200 block flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" /> Nhạc nền MP3
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Bài hát hiện tại: <strong className="text-neutral-200">{coupleInfo.customSong || template.audioTitle || 'Marry You'}</strong>
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-medium cursor-pointer border border-neutral-700">
                    <FileAudio className="w-3.5 h-3.5" />
                    <span>Tải file nhạc MP3 từ máy của bạn</span>
                    <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ============================================================ */}
        {/* CENTER PHONE WORKSPACE (CANVAS PREVIEW)                      */}
        {/* ============================================================ */}
        <main className="flex-1 bg-[#0a0c10] flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto relative">
          {/* Subtle Background Glow */}
          <div className="absolute w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* VIEW MODE SEGMENTED CONTROL (Switch between Live Iframe, Poster HD, and Custom) */}
          <div className="flex items-center justify-center gap-1 mb-3 bg-[#161922] p-1 rounded-xl border border-neutral-800 text-xs z-20 shrink-0 shadow-lg">
            <button
              onClick={() => setDisplayMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                displayMode === 'live'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thiệp tương tác gốc (Live)</span>
            </button>
            <button
              onClick={() => setDisplayMode('poster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                displayMode === 'poster'
                  ? 'bg-neutral-700 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Thiết kế dọc gốc (Poster)</span>
            </button>
            <button
              onClick={() => setDisplayMode('customized')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                displayMode === 'customized'
                  ? 'bg-neutral-700 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Lồng ảnh &amp; Dâu rể</span>
            </button>
          </div>

          {/* Scalable Phone Container */}
          <div
            style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center center' }}
            className="transition-transform duration-200 ease-out z-10"
          >
            {/* iPhone Frame Simulator */}
            <div className="relative w-[320px] sm:w-[350px] h-[640px] sm:h-[680px] bg-neutral-900 rounded-[50px] p-3 shadow-2xl border-4 border-neutral-800 flex flex-col">
              {/* Dynamic Island Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
                <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse" />
              </div>

              {/* Inner Phone Screen */}
              <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col text-neutral-900">
                {/* Phone Status Bar */}
                <div className="h-9 bg-white/95 backdrop-blur-sm w-full flex items-center justify-between px-6 pt-1 text-[11px] font-semibold text-neutral-800 z-20 shrink-0 select-none border-b border-neutral-100">
                  <span>9:41</span>
                  <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[120px]">{template.templateName}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-2 border border-neutral-800 rounded-sm" />
                  </div>
                </div>

                {/* MODE 1: 100% AUTHENTIC INTERACTIVE IFRAME DIRECTLY FROM ORIGINAL TEMPLATE */}
                {displayMode === 'live' && (
                  <div className="flex-1 w-full h-full relative overflow-hidden bg-neutral-950">
                    <iframe
                      key={template.slug}
                      src={cineloveIframeSrc}
                      className="w-full h-full border-0 select-auto"
                      allow="autoplay; clipboard-write"
                      title={template.templateName}
                    />
                  </div>
                )}

                {/* MODE 2: ORIGINAL FULL-LENGTH VERTICAL TEMPLATE POSTER (HIGH-RES WEBP) */}
                {displayMode === 'poster' && (
                  <div
                    ref={phoneCaptureRef}
                    className="flex-1 overflow-y-auto preview-scrollbar bg-neutral-100 select-none"
                  >
                    <img
                      src={templateCoverImg}
                      alt={template.templateName}
                      className="w-full h-auto object-cover select-none"
                    />
                  </div>
                )}

                {/* MODE 3: CUSTOMIZED WEDDING INVITATION OVERLAY */}
                {displayMode === 'customized' && (
                  <div
                    ref={phoneCaptureRef}
                    className="flex-1 overflow-y-auto preview-scrollbar relative bg-white pb-10 select-none"
                  >
                    {/* Template Header Art */}
                    <div className="bg-neutral-50 pt-5 pb-3 px-4 text-center border-b border-neutral-100 relative">
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[9px] uppercase tracking-wider mb-2">
                        {template.templateName} &bull; L-STUDIO
                      </div>

                      <h2 className="text-xl font-bold font-display text-neutral-900 tracking-tight leading-snug">
                        {coupleInfo.groomName || 'Chú rể'}
                        <span className="block text-neutral-400 font-serif font-light text-base my-0.5">&amp;</span>
                        {coupleInfo.brideName || 'Cô dâu'}
                      </h2>

                      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-1">
                        SAVE THE DATE &bull; LỄ THÀNH HÔN
                      </p>

                      {/* Countdown Badge */}
                      {daysRemaining !== null && (
                        <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-mono shadow-xs">
                          Còn {daysRemaining} ngày nữa
                        </div>
                      )}
                    </div>

                    {/* Couple Photo Container styled by placement */}
                    <div className="p-4 bg-neutral-100 flex items-center justify-center relative overflow-hidden">
                      {photoPlacement === 'arch' ? (
                        <div className="w-56 aspect-[3/4] rounded-t-full rounded-b-xl overflow-hidden shadow-md border-4 border-white bg-white relative">
                          <img
                            src={displayPhoto}
                            alt="Ảnh dâu rể"
                            crossOrigin="anonymous"
                            style={{ transform: `scale(${photoZoom})` }}
                            className="w-full h-full object-cover object-top transition-transform duration-300"
                          />
                        </div>
                      ) : photoPlacement === 'circle' ? (
                        <div className="w-52 h-52 rounded-full overflow-hidden shadow-md border-4 border-white bg-white relative">
                          <img
                            src={displayPhoto}
                            alt="Ảnh dâu rể"
                            crossOrigin="anonymous"
                            style={{ transform: `scale(${photoZoom})` }}
                            className="w-full h-full object-cover object-center transition-transform duration-300"
                          />
                        </div>
                      ) : photoPlacement === 'rounded' ? (
                        <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white relative">
                          <img
                            src={displayPhoto}
                            alt="Ảnh dâu rể"
                            crossOrigin="anonymous"
                            style={{ transform: `scale(${photoZoom})` }}
                            className="w-full h-full object-cover object-top transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        /* Hero Full */
                        <div className="w-full aspect-[3/4] overflow-hidden relative">
                          <img
                            src={displayPhoto}
                            alt="Ảnh dâu rể"
                            crossOrigin="anonymous"
                            style={{ transform: `scale(${photoZoom})` }}
                            className="w-full h-full object-cover object-top transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </div>
                      )}
                    </div>

                    {/* Wedding Ceremony & Venue Details */}
                    <div className="p-4 sm:p-5 text-center space-y-3 bg-white text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          HÔN LỄ ĐƯỢC TỔ CHỨC VÀO LÚC
                        </span>
                        <p className="text-lg font-bold font-display text-neutral-900">
                          {coupleInfo.weddingTime} &bull; {coupleInfo.weddingDate}
                        </p>
                        {coupleInfo.lunarDate && (
                          <p className="text-[11px] text-neutral-500 font-serif italic -mt-0.5">
                            (Tức ngày {coupleInfo.lunarDate})
                          </p>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center space-y-0.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          ĐỊA ĐIỂM TIỆC CƯỚI
                        </span>
                        <h4 className="font-bold text-neutral-900 text-xs font-display">
                          {coupleInfo.venueName}
                        </h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
                          {coupleInfo.venueAddress}
                        </p>
                      </div>

                      {/* Invitation Message Quote */}
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] italic text-neutral-700 leading-relaxed font-serif">
                        &ldquo;{coupleInfo.invitationMessage}&rdquo;
                      </div>

                      {/* VietQR Bank Gift Box simulation */}
                      {coupleInfo.bankAccount && (
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-left px-1">
                          <div className="text-[10px]">
                            <span className="block font-semibold text-neutral-800">Hộp mừng cưới số</span>
                            <span className="font-mono text-neutral-500">{coupleInfo.bankAccount} ({coupleInfo.bankName?.toUpperCase()})</span>
                            <span className="block text-[9px] text-neutral-400">{coupleInfo.bankOwner}</span>
                          </div>
                          {vietQrUrl && (
                            <img
                              src={vietQrUrl}
                              alt="VietQR"
                              crossOrigin="anonymous"
                              className="w-12 h-12 object-contain rounded border border-neutral-200"
                            />
                          )}
                        </div>
                      )}

                      <div className="pt-2 text-[9px] text-neutral-400 font-mono tracking-wider text-center">
                        <span>THIỆP CƯỚI THIẾT KẾ BỞI L-STUDIO</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================ */}
      {/* 3. SUCCESS PUBLISH & SHARE MODAL                             */}
      {/* ============================================================ */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 border border-neutral-200 text-neutral-900 animate-scale-up">
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
                Link Thiệp Mời Đã Được Tạo Thành Công!
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Link công khai chuẩn GitHub Pages. Quý khách có thể gửi cho bạn bè qua Zalo, Messenger hoặc mở xem thử:
              </p>
            </div>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 inline-block mx-auto shadow-xs">
                <img
                  src={qrCodeDataUrl}
                  alt="Mã QR Thiệp Mời"
                  className="w-44 h-44 object-contain mx-auto"
                />
                <span className="block text-[10px] text-neutral-400 font-mono mt-1">
                  Quét bằng camera điện thoại để xem trực tiếp
                </span>
              </div>
            )}

            {/* Public URL Box */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-left">
              <input
                type="text"
                readOnly
                value={publicShareUrl}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs font-mono text-neutral-700 outline-none select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã chép!' : 'Chép'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  if (publicShareUrl) window.open(publicShareUrl, '_blank');
                }}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở xem trang thiệp mời ngay (Tab mới)</span>
              </button>

              <button
                onClick={() => {
                  setShareModalOpen(false);
                  onPreviewLive(template, coupleInfo, photoPlacement);
                }}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-600" />
                <span>Xem giao diện khách mời trực tiếp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
