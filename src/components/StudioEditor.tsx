import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Menu, Eye, Share2, Download,
  Upload, Image as ImageIcon, Trash2,
  CreditCard, Bot, FileAudio, Check, Copy,
  CheckCircle2, ExternalLink, Sparkles, ChevronDown, ChevronUp,
  X, Music, Type, FolderHeart, Shapes,
  Grid, Music2, CalendarDays, SlidersHorizontal, LayoutGrid,
  RotateCcw, RotateCw, Bookmark, ZoomIn, ZoomOut, MessageCircle,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { Template, CoupleInfo } from '../types/template';
import { getAssetUrl, getAudioUrl } from '../utils/formatters';
import { buildInvitationUrl } from '../utils/share';

export type PhotoPlacement = 'arch' | 'circle' | 'rounded' | 'hero';

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

export const StudioEditor: React.FC<StudioEditorProps> = ({
  template,
  allTemplates,
  onBack,
  onPreviewLive,
  onSelectTemplate,
}) => {
  // Left toolbar active drawer tool
  const [activeLeftTool, setActiveLeftTool] = useState<string | null>(null);

  // Canvas zoom scale
  const [canvasScale, setCanvasScale] = useState<number>(1);

  // Quick photo replacer bar expanded
  const [isPhotoBarOpen, setIsPhotoBarOpen] = useState<boolean>(true);

  // Advanced toggles in Right Sidebar
  const [watermarkRemoved, setWatermarkRemoved] = useState<boolean>(true);
  const [bottomToolbarEnabled, setBottomToolbarEnabled] = useState<boolean>(true);
  const [categorySelected, setCategorySelected] = useState<string>('wedding');
  const [statusSelected, setStatusSelected] = useState<string>('public');

  // Photo placement style
  const [photoPlacement, setPhotoPlacement] = useState<PhotoPlacement>('arch');

  // Audio playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasCaptureRef = useRef<HTMLDivElement | null>(null);

  // Publish & Share State
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [publicShareUrl, setPublicShareUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Quick Replace Filmstrip Photos state (5 slots)
  const [slotPhotos, setSlotPhotos] = useState<string[]>([]);
  const [activeReplaceSlot, setActiveReplaceSlot] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Couple Information State
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo>({
    groomName: 'Minh Trí',
    brideName: 'Thanh Hằng',
    weddingDate: '2026-12-18',
    weddingTime: '11:30',
    lunarDate: '10 tháng 11 năm Bính Ngọ',
    venueName: 'Trung Tâm Hội Nghị & Tiệc Cưới White Palace',
    venueAddress: '194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh',
    invitationMessage: 'Sự hiện diện của quý khách là niềm vinh hạnh lớn nhất cho gia đình chúng tôi!',
    coverImage: '',
    themeColor: 'neutral',
    fontFamilyChoice: 'sans',
    bankName: 'vietcombank',
    bankAccount: '9988776655',
    bankOwner: 'MINH TRI',
    customSong: '',
    customAudioUrl: '',
  });

  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [aiToneSelected, setAiToneSelected] = useState<string>('');

  // Extract wedding month for canvas calligraphy (e.g., "Tháng 12")
  const weddingMonthText = useMemo(() => {
    if (!coupleInfo.weddingDate) return 'Tháng 12';
    try {
      const d = new Date(coupleInfo.weddingDate);
      const m = d.getMonth() + 1;
      return `Tháng ${m < 10 ? '0' + m : m}`;
    } catch {
      return 'Tháng 12';
    }
  }, [coupleInfo.weddingDate]);

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
          const imgResult = ev.target.result as string;
          setCoupleInfo((prev) => ({ ...prev, coverImage: imgResult }));
          // Update filmstrip slot
          const updatedSlots = [...slotPhotos];
          updatedSlots[activeReplaceSlot] = imgResult;
          setSlotPhotos(updatedSlots);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlotClick = (index: number) => {
    setActiveReplaceSlot(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      setCoupleInfo((prev) => ({ ...prev, coverImage: imageUrlInput.trim() }));
      const updatedSlots = [...slotPhotos];
      updatedSlots[activeReplaceSlot] = imageUrlInput.trim();
      setSlotPhotos(updatedSlots);
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
    if (!canvasCaptureRef.current) return;
    setIsExportingPng(true);
    try {
      const dataUrl = await toPng(canvasCaptureRef.current, {
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

  // 10-Tool Vertical Strip Definitions
  const LEFT_TOOLS = [
    { id: 'text', label: 'Văn bản', icon: Type },
    { id: 'image', label: 'Hình ảnh', icon: ImageIcon },
    { id: 'stock', label: 'Stock', icon: FolderHeart },
    { id: 'shapes', label: 'Hình dạng', icon: Shapes },
    { id: 'background', label: 'Nền', icon: Grid },
    { id: 'music', label: 'Âm nhạc', icon: Music2 },
    { id: 'widgets', label: 'Tiện ích', icon: CalendarDays },
    { id: 'preset', label: 'Preset', icon: SlidersHorizontal },
    { id: 'templates', label: 'Mẫu', icon: LayoutGrid },
    { id: 'effects', label: 'Hiệu ứng', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-neutral-800 font-sans select-none overflow-hidden">
      {/* Hidden Audio element */}
      <audio ref={audioRef} src={currentAudioSrc} loop preload="auto" />

      {/* Hidden Image File Input for Quick Replace */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Authentic CineLove Studio Navigation Bar)                   */}
      {/* ========================================================================= */}
      <header className="h-14 bg-white border-b border-neutral-200 px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Hamburger, Brand Logo, Undo/Redo, Bookmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
            title="Thoát Studio"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo with Pink Icon Badge */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              L
            </div>
            <span className="font-bold text-lg font-sans text-neutral-900 tracking-tight">
              L-Studio
            </span>
          </div>

          <div className="h-4 w-px bg-neutral-200 mx-1 hidden sm:block" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
              title="Hoàn tác (Undo)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
              title="Làm lại (Redo)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
              title="Đã lưu vào bộ nhớ"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Autosave Status message */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <span className="text-neutral-400 italic">
            Xuất bản để lưu thiết kế vào hệ thống
          </span>
          <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Lưu tạm thời: Bật</span>
          </div>
        </div>

        {/* Right: Preview, Export PNG, Publish, Avatar */}
        <div className="flex items-center gap-2">
          {/* Download PNG Button */}
          <button
            onClick={handleExportPng}
            disabled={isExportingPng}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors disabled:opacity-50"
            title="Tải ảnh thiệp PNG 2.5x HD"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">{isExportingPng ? 'Đang xuất...' : 'Xuất PNG'}</span>
          </button>

          {/* Xem trước Button */}
          <button
            onClick={() => onPreviewLive(template, coupleInfo, photoPlacement)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors"
          >
            <Eye className="w-4 h-4 text-neutral-500" />
            <span>Xem trước</span>
          </button>

          {/* Xuất bản Button (Blue Pill Button) */}
          <button
            onClick={handlePublishAndShare}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Xuất bản</span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-300 bg-neutral-100 shrink-0">
            <img
              src={displayPhoto}
              alt="Avatar"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: 10-TOOL STRIP + CENTER CANVAS + RIGHT SIDEBAR             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ----------------------------------------------------------------------- */}
        {/* A. LEFT 10-ICON TOOLBAR STRIP                                           */}
        {/* ----------------------------------------------------------------------- */}
        <nav aria-label="Thanh công cụ thiết kế" className="w-16 bg-white border-r border-neutral-200 flex flex-col items-center py-2 shrink-0 z-20 overflow-y-auto preview-scrollbar">
          {LEFT_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeLeftTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveLeftTool(isActive ? null : tool.id)}
                className={`w-full py-2.5 flex flex-col items-center justify-center gap-1 text-[11px] transition-colors relative ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/60 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-neutral-500'}`} />
                <span className="leading-none text-[10px]">{tool.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Optional Flyout Subpanel when clicking a tool */}
        {activeLeftTool && (
          <aside aria-label="Bảng điều khiển công cụ" className="w-72 bg-white border-r border-neutral-200 flex flex-col z-20 shrink-0 shadow-lg animate-fade-in">
            <div className="p-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                {LEFT_TOOLS.find((t) => t.id === activeLeftTool)?.label}
              </span>
              <button
                onClick={() => setActiveLeftTool(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs preview-scrollbar">
              {/* IMAGE TOOL FLYOUT */}
              {activeLeftTool === 'image' && (
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-2">
                    <p className="text-neutral-600 font-medium">Tải ảnh cưới của bạn</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Hoặc dán URL ảnh:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                      />
                      <button
                        onClick={handleApplyImageUrl}
                        className="px-2.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>

                  {coupleInfo.coverImage && (
                    <button
                      onClick={handleResetToTemplatePhoto}
                      className="w-full py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Dùng ảnh mẫu gốc</span>
                    </button>
                  )}
                </div>
              )}

              {/* TEMPLATES TOOL FLYOUT (134 templates) */}
              {activeLeftTool === 'templates' && (
                <div className="space-y-2">
                  <span className="text-[11px] text-neutral-500 block">
                    Đổi sang mẫu khác trong bộ sưu tập ({allTemplates.length} mẫu):
                  </span>
                  <div className="space-y-1.5 max-h-[60vh] overflow-y-auto preview-scrollbar">
                    {allTemplates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTemplate(t);
                          setActiveLeftTool(null);
                        }}
                        className={`w-full p-2 rounded-xl text-left flex items-center gap-2 border transition-colors ${
                          t.id === template.id
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <img
                          src={getAssetUrl(t.thumbnail)}
                          alt={t.templateName}
                          className="w-9 h-11 object-cover rounded shrink-0 border border-neutral-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate">{t.templateName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono truncate">{t.slug}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MUSIC TOOL FLYOUT */}
              {activeLeftTool === 'music' && (
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="text-[11px] text-neutral-500 block">Bài hát hiện tại:</span>
                    <p className="font-bold text-neutral-800 text-xs">
                      {coupleInfo.customSong || template.audioTitle || 'Marry You'}
                    </p>
                    <label className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                      <FileAudio className="w-3.5 h-3.5" />
                      <span>Tải file MP3 từ máy</span>
                      <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}

              {/* DEFAULT FLYOUT CONTENT FOR OTHER TOOLS */}
              {activeLeftTool !== 'image' && activeLeftTool !== 'templates' && activeLeftTool !== 'music' && (
                <div className="text-center py-6 text-neutral-400 space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-amber-500" />
                  <p className="text-xs font-medium text-neutral-600">Đã mở khóa toàn bộ tính năng</p>
                  <p className="text-[11px] text-neutral-400">
                    Bạn có thể tùy chỉnh thiệp trực tiếp từ bảng điều khiển bên phải hoặc trên canvas.
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* B. CENTER CANVAS WORKSPACE                                              */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 bg-[#f3f4f6] flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto relative">
          {/* Main Artwork Canvas Card */}
          <div
            style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center center' }}
            className="transition-transform duration-200 ease-out z-10 my-auto"
          >
            {/* The Wedding Card Container */}
            <div
              ref={canvasCaptureRef}
              className="relative w-[360px] sm:w-[400px] h-[640px] sm:h-[680px] bg-white rounded-2xl shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col select-none"
            >
              {/* Background Poster Artwork from Selected Template */}
              <img
                src={displayPhoto}
                alt={template.templateName}
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.96]"
              />

              {/* Gradient Overlay for Typography Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60 pointer-events-none" />

              {/* TOP CALLIGRAPHY: "Save The Date" */}
              <div className="relative z-10 pt-8 text-center px-4">
                <span className="font-script text-4xl sm:text-5xl text-neutral-900 tracking-wide drop-shadow-sm block">
                  Save The Date
                </span>
              </div>

              {/* CENTER-BOTTOM CALLIGRAPHY: BRIDE & GROOM NAMES */}
              <div className="relative z-10 flex-1 flex flex-col justify-end pb-16 px-6 text-center">
                <div className="space-y-1">
                  <h2 className="font-cursive text-3xl sm:text-4xl text-neutral-900 tracking-wide drop-shadow-md leading-tight">
                    {coupleInfo.brideName || 'Thanh Hằng'}
                  </h2>
                  <span className="font-script text-2xl text-neutral-700 block my-0.5">
                    &amp;
                  </span>
                  <h2 className="font-cursive text-3xl sm:text-4xl text-neutral-900 tracking-wide drop-shadow-md leading-tight">
                    {coupleInfo.groomName || 'Minh Trí'}
                  </h2>
                </div>

                {/* BOTTOM CALLIGRAPHY: "Our wedding day" & MONTH */}
                <div className="pt-6 flex items-center justify-between px-2 text-neutral-900 font-script text-2xl">
                  <span className="drop-shadow-sm">Our wedding day</span>
                  <span className="drop-shadow-sm font-cursive text-3xl">{weddingMonthText}</span>
                </div>
              </div>

              {/* Top-Right Circular Music Button */}
              <button
                onClick={toggleAudio}
                className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
                  isPlayingAudio ? 'animate-spin-slow' : ''
                }`}
                title={isPlayingAudio ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
              >
                <Music className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* FLOATING OVERLAYS ON CANVAS                                           */}
          {/* --------------------------------------------------------------------- */}

          {/* 1. Bottom-Left Floating Bar: "Thay ảnh nhanh ˇ" */}
          <div className="absolute bottom-4 left-6 z-20 flex flex-col gap-2">
            <button
              onClick={() => setIsPhotoBarOpen(!isPhotoBarOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-md border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-white transition-all w-fit"
            >
              <span>Thay ảnh nhanh</span>
              {isPhotoBarOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Filmstrip Thumbnail Row */}
            {isPhotoBarOpen && (
              <div className="flex items-center gap-2 p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200 animate-fade-in">
                {[0, 1, 2, 3, 4].map((slotIdx) => {
                  const slotImg = slotPhotos[slotIdx] || displayPhoto;
                  return (
                    <button
                      key={slotIdx}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`relative w-12 h-14 rounded-xl overflow-hidden border-2 transition-all group ${
                        activeReplaceSlot === slotIdx
                          ? 'border-blue-600 shadow-sm scale-105'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                      title={`Nhấp để thay ảnh vị trí ${slotIdx + 1}`}
                    >
                      <img
                        src={slotImg}
                        alt={`Ảnh ${slotIdx + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                        <ImageIcon className="w-3.5 h-3.5 text-white drop-shadow" />
                      </div>
                    </button>
                  );
                })}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-14 rounded-xl border border-dashed border-neutral-300 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-center text-neutral-400 hover:text-blue-600 transition-colors"
                  title="Tải ảnh mới"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Floating Right Zoom Controls */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-neutral-200 space-y-1 text-xs font-mono">
            <button
              onClick={() => setCanvasScale((prev) => Math.min(prev + 0.1, 1.4))}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-neutral-600 font-bold px-1 py-0.5">
              {Math.round(canvasScale * 100)}%
            </span>
            <button
              onClick={() => setCanvasScale((prev) => Math.max(prev - 0.1, 0.7))}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* 3. Floating Bottom-Right Chat/Action FAB */}
          <button
            onClick={() => onPreviewLive(template, coupleInfo, photoPlacement)}
            className="absolute bottom-6 right-6 z-20 w-11 h-11 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            title="Hỗ trợ & Xem trước"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* C. RIGHT SIDEBAR ("Tuỳ chỉnh")                                          */}
        {/* ----------------------------------------------------------------------- */}
        <aside aria-label="Tùy chỉnh thiết kế" className="w-80 lg:w-[360px] bg-white border-l border-neutral-200 flex flex-col shrink-0 z-20 overflow-y-auto preview-scrollbar text-xs">
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <span className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
              <span>✏</span>
              <span>Tuỳ chỉnh</span>
            </span>
          </div>

          {/* Content Sections */}
          <div className="p-4 space-y-5">
            {/* 1. Danh mục * */}
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">
                Danh mục <span className="text-rose-500">*</span>
              </label>
              <select
                value={categorySelected}
                onChange={(e) => setCategorySelected(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white"
              >
                <option value="wedding">Thiệp cưới</option>
                <option value="birthday">Sinh nhật</option>
                <option value="event">Sự kiện</option>
                <option value="graduation">Tốt nghiệp</option>
                <option value="anniversary">Kỷ niệm</option>
              </select>
            </div>

            {/* 2. Trạng thái */}
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">
                Trạng thái
              </label>
              <select
                value={statusSelected}
                onChange={(e) => setStatusSelected(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white"
              >
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
              </select>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Chỉ khi ở trạng thái "Công khai", trang mới có thể xem được từ URL của trang.
              </p>
            </div>

            {/* 3. Bản xem trước (Social Share Preview Card) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-neutral-700">Bản xem trước</span>
                <button
                  onClick={() => onPreviewLive(template, coupleInfo, photoPlacement)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <span>✏ Chỉnh sửa</span>
                </button>
              </div>

              <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50">
                <div className="w-full h-32 bg-neutral-900 overflow-hidden relative">
                  <img
                    src={displayPhoto}
                    alt="Social Share Thumbnail"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="font-cursive text-2xl text-white drop-shadow">
                      {coupleInfo.brideName} &amp; {coupleInfo.groomName}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white space-y-1">
                  <h4 className="font-bold text-neutral-900 text-xs truncate">
                    Lễ Thành Hôn: {coupleInfo.groomName} &amp; {coupleInfo.brideName}
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Đây là cách trang của bạn sẽ hiển thị khi được chia sẻ trên Facebook, Zalo, Messenger hoặc các mạng xã hội khác.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Tính năng nâng cao (Unlocked 100%) */}
            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs">Tính năng nâng cao</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white font-mono">
                  Basic+
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Nâng cấp lên gói Basic+ để sử dụng các tính năng nâng cao sau:
              </p>

              {/* Feature 1: Xóa watermark */}
              <div className="flex items-start justify-between gap-2 pt-1 border-t border-blue-100/60">
                <div>
                  <span className="font-bold text-neutral-800 block text-xs">&bull; Xóa watermark</span>
                  <p className="text-[11px] text-neutral-500">
                    Xóa dòng "Made with Cinelove" để tạo trang web hoàn toàn riêng tư.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWatermarkRemoved(!watermarkRemoved)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 mt-0.5 ${
                    watermarkRemoved ? 'bg-blue-600' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                      watermarkRemoved ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Feature 2: Tùy chỉnh thanh công cụ dưới */}
              <div className="flex items-start justify-between gap-2 pt-2 border-t border-blue-100/60">
                <div>
                  <span className="font-bold text-neutral-800 block text-xs">
                    &bull; Tùy chỉnh thanh công cụ dưới
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Bật/tắt hiển thị thanh công cụ (lời chúc, mừng cưới, chia sẻ).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBottomToolbarEnabled(!bottomToolbarEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 mt-0.5 ${
                    bottomToolbarEnabled ? 'bg-blue-600' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                      bottomToolbarEnabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 5. THÔNG TIN DÂU RỂ & NGÀY CƯỚI FORM */}
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <span className="font-bold text-neutral-800 text-xs block">
                Thông tin thiệp cưới
              </span>

              {/* Bride & Groom names */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Chú Rể
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.groomName}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, groomName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Cô Dâu
                  </label>
                  <input
                    type="text"
                    value={coupleInfo.brideName}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, brideName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:bg-white"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Ngày cưới
                  </label>
                  <input
                    type="date"
                    value={coupleInfo.weddingDate}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingDate: e.target.value })}
                    className="w-full px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Giờ tổ chức
                  </label>
                  <input
                    type="time"
                    value={coupleInfo.weddingTime}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingTime: e.target.value })}
                    className="w-full px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs focus:bg-white"
                  />
                </div>
              </div>

              {/* Venue Name & Address */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Địa điểm tiệc cưới
                </label>
                <input
                  type="text"
                  value={coupleInfo.venueName}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, venueName: e.target.value })}
                  placeholder="Trung tâm tiệc cưới..."
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Địa chỉ chi tiết (Google Maps)
                </label>
                <input
                  type="text"
                  value={coupleInfo.venueAddress}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, venueAddress: e.target.value })}
                  placeholder="Số nhà, tên đường, quận/huyện..."
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white"
                />
              </div>

              {/* Invitation message with AI Assistant */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-neutral-600">
                    Lời ngỏ yêu thương
                  </label>
                  <span className="text-[10px] text-blue-600 font-mono flex items-center gap-1">
                    <Bot className="w-3 h-3" /> AI Gợi ý
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {AI_MESSAGE_PRESETS.map((p) => (
                    <button
                      key={p.tone}
                      type="button"
                      onClick={() => {
                        const text = p.msg(coupleInfo.groomName, coupleInfo.brideName);
                        setCoupleInfo({ ...coupleInfo, invitationMessage: text });
                        setAiToneSelected(p.tone);
                      }}
                      className={`px-2 py-1 rounded-lg text-left border text-[10px] transition-all ${
                        aiToneSelected === p.tone
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {p.tone}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={coupleInfo.invitationMessage}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, invitationMessage: e.target.value })}
                  placeholder="Nhập lời ngỏ gửi khách mời..."
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 leading-relaxed text-xs focus:bg-white"
                />
              </div>

              {/* VietQR Bank Account */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <span className="font-semibold text-neutral-700 block text-[11px] flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Hộp mừng cưới số (VietQR)</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={coupleInfo.bankName}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, bankName: e.target.value })}
                    className="px-2 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={coupleInfo.bankAccount}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, bankAccount: e.target.value })}
                    placeholder="Số tài khoản..."
                    className="px-2 py-1.5 bg-white border border-neutral-200 rounded-lg font-mono text-xs"
                  />
                </div>
                {vietQrUrl && (
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200/80">
                    <span className="text-[10px] text-neutral-500">Mã VietQR tự động:</span>
                    <img src={vietQrUrl} alt="VietQR" className="w-10 h-10 object-contain rounded bg-white border border-neutral-200 p-0.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUCCESS PUBLISH MODAL                                                  */}
      {/* ========================================================================= */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
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
              <h3 className="text-lg font-bold font-sans text-neutral-900">
                Link Thiệp Mời Đã Được Xuất Bản!
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Link công khai chuẩn GitHub Pages. Quý khách có thể gửi cho bạn bè qua Zalo, Messenger hoặc quét mã QR:
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
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở xem trang thiệp mời ngay</span>
              </button>

              <button
                onClick={() => {
                  setShareModalOpen(false);
                  onPreviewLive(template, coupleInfo, photoPlacement);
                }}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-600" />
                <span>Xem giao diện khách mời</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
