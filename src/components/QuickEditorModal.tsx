import React, { useState, useMemo, useRef } from 'react';
import {
  X, Check, Calendar, MapPin, Music, Copy, Wand2, Bot,
  CreditCard, Clock, Upload, Image as ImageIcon, Trash2, Download,
  Palette, FileAudio, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { Template, CoupleInfo } from '../types/template';
import { getAssetUrl } from '../utils/formatters';

interface QuickEditorModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
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

type EditorTab = 'photo' | 'info' | 'message' | 'music_qr' | 'style';

export const QuickEditorModal: React.FC<QuickEditorModalProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('photo');
  const cardPreviewRef = useRef<HTMLDivElement | null>(null);

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

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiToneSelected, setAiToneSelected] = useState<string>('');

  // Handle image upload from user device
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
        }
      };
      reader.readAsDataURL(file);
    }
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

  const handleShare = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = async () => {
    if (!cardPreviewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardPreviewRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `thiep-cuoi-${coupleInfo.groomName}-${coupleInfo.brideName}.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 60, spread: 50 });
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Không thể tạo ảnh thiệp, vui lòng thử lại');
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
    ? `https://img.vietqr.io/image/${coupleInfo.bankName || 'vietcombank'}-${coupleInfo.bankAccount}-compact.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(coupleInfo.groomName || 'chu re')}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-auto max-h-[94vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Tools & Customizer Options */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider">
                L-STUDIO EDITOR
              </span>
              <span className="text-xs text-neutral-500 font-mono truncate">{template.templateName}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-neutral-900">
              Trình Chỉnh Sửa &amp; Tải Ảnh Thiệp Cưới
            </h2>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-5 pt-3 border-b border-neutral-200 overflow-x-auto scrollbar-none no-scrollbar">
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'photo'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>1. Tải ảnh dâu rể</span>
              {coupleInfo.coverImage && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>2. Thông tin lễ cưới</span>
            </button>

            <button
              onClick={() => setActiveTab('message')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'message'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>3. Lời mời AI</span>
            </button>

            <button
              onClick={() => setActiveTab('music_qr')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'music_qr'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>4. VietQR &amp; Nhạc</span>
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'style'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>5. Tông màu</span>
            </button>
          </div>

          {/* Form Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
            {/* TAB 1: PHOTO UPLOAD */}
            {activeTab === 'photo' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 text-sm mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-neutral-700" />
                    <span>Tải ảnh cưới dâu rể từ điện thoại / máy tính</span>
                  </h4>
                  <p className="text-xs text-neutral-500 mb-3">
                    Ảnh tải lên sẽ hiển thị trực tiếp làm ảnh bìa chính trên thiệp cưới của bạn.
                  </p>

                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl p-6 bg-white cursor-pointer transition-colors group">
                    <Upload className="w-8 h-8 text-neutral-400 group-hover:text-neutral-900 mb-2 transition-colors" />
                    <span className="text-xs font-semibold text-neutral-800 group-hover:text-neutral-950">
                      Bấm vào đây để chọn ảnh từ máy của bạn
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-1 font-mono">
                      Hỗ trợ JPG, PNG, WEBP (tối đa 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {coupleInfo.coverImage ? (
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={coupleInfo.coverImage}
                        alt="Ảnh vừa tải"
                        className="w-14 h-14 object-cover rounded-lg border border-neutral-200"
                      />
                      <div>
                        <span className="block font-semibold text-xs text-neutral-900">Ảnh dâu rể đã tải lên</span>
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Đang áp dụng lên thiệp
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCoupleInfo((prev) => ({ ...prev, coverImage: '' }))}
                      className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-50 transition-colors"
                      title="Xóa ảnh tự chọn, dùng ảnh mẫu gốc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">
                    Chưa tải ảnh tự chọn. Thiệp đang hiển thị ảnh mẫu thiết kế mặc định.
                  </p>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('info')}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-xl text-xs sm:text-sm"
                  >
                    Tiếp tục: Chỉnh sửa thông tin hôn lễ &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: WEDDING INFO */}
            {activeTab === 'info' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Tên Chú Rể</label>
                    <input
                      type="text"
                      value={coupleInfo.groomName}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, groomName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                      placeholder="Nguyễn Hoàng Nam"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Tên Cô Dâu</label>
                    <input
                      type="text"
                      value={coupleInfo.brideName}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, brideName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                      placeholder="Trần Mai Linh"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-700" /> Ngày tổ chức
                    </label>
                    <input
                      type="date"
                      value={coupleInfo.weddingDate}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingDate: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-700" /> Giờ đón khách
                    </label>
                    <input
                      type="text"
                      value={coupleInfo.weddingTime}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingTime: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-mono"
                      placeholder="11:30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-700" /> Địa điểm tiệc cưới
                    </label>
                    <input
                      type="text"
                      value={coupleInfo.venueName}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, venueName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm"
                      placeholder="Trung tâm hội nghị tiệc cưới..."
                    />
                  </div>
                  <input
                    type="text"
                    value={coupleInfo.venueAddress}
                    onChange={(e) => setCoupleInfo({ ...coupleInfo, venueAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm"
                    placeholder="Địa chỉ số nhà, đường, quận, thành phố..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('message')}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-xl text-xs sm:text-sm"
                  >
                    Tiếp tục: Viết lời mời cưới &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: MESSAGE & AI */}
            {activeTab === 'message' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">
                    Lời nhắn gửi khách mời
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Assistant</span>
                  </span>
                </div>

                {/* AI Preset buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {AI_MESSAGE_PRESETS.map((p) => (
                    <button
                      key={p.tone}
                      type="button"
                      onClick={() => handleApplyAiPreset(p)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        aiToneSelected === p.tone
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      <Wand2 className="w-2.5 h-2.5 text-amber-400" />
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
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-xl text-xs sm:text-sm"
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
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã tạo link mời cưới!' : 'Lưu & Sao chép link'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Visual Card Simulation (Capturable by html-to-image) */}
        <div className="w-full lg:w-1/2 bg-neutral-100 p-5 sm:p-7 flex flex-col items-center justify-center overflow-y-auto">
          <div className="text-center mb-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-bold">
              BẢN XEM TRƯỚC THỰC TẾ &bull; L-STUDIO
            </span>
          </div>

          {/* Renderable Wedding Card Container */}
          <div
            ref={cardPreviewRef}
            className="w-[300px] bg-white rounded-2xl shadow-xl border border-neutral-300/80 overflow-hidden relative text-neutral-900"
          >
            {/* Card Header Header */}
            <div className="relative h-40 bg-neutral-50 flex flex-col items-center justify-center p-4 text-center border-b border-neutral-200">
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-neutral-400 font-bold mb-1">
                L-STUDIO WEDDING INVITATION
              </span>
              <h3 className="text-xl font-bold font-display text-neutral-900 leading-tight">
                {coupleInfo.groomName || 'Chú rể'}
              </h3>
              <span className="text-neutral-400 text-xs font-serif my-0.5">&amp;</span>
              <h3 className="text-xl font-bold font-display text-neutral-900 leading-tight">
                {coupleInfo.brideName || 'Cô dâu'}
              </h3>

              {/* Countdown badge */}
              {daysRemaining !== null && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-neutral-900 text-white text-[9px] font-mono">
                  Còn {daysRemaining} ngày
                </div>
              )}
            </div>

            {/* Couple Photo (Uploaded or Default Template) */}
            <div className="h-44 overflow-hidden relative bg-neutral-100">
              <img
                src={displayCoverImg}
                alt="Ảnh dâu rể"
                crossOrigin="anonymous"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            {/* Event Details */}
            <div className="p-4 text-center space-y-2 bg-white text-xs">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-mono font-medium">
                {coupleInfo.weddingTime} &bull; {coupleInfo.weddingDate}
              </div>

              <div>
                <p className="font-semibold text-neutral-900 text-xs font-display">
                  {coupleInfo.venueName}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1 font-sans">
                  {coupleInfo.venueAddress}
                </p>
              </div>

              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] italic text-neutral-600 leading-relaxed font-serif">
                &ldquo;{coupleInfo.invitationMessage}&rdquo;
              </div>

              {/* VietQR Bank Gift Box simulation */}
              {coupleInfo.bankAccount && (
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-left px-1">
                  <div className="text-[10px]">
                    <span className="block font-semibold text-neutral-800">Hộp mừng cưới số</span>
                    <span className="font-mono text-neutral-500">{coupleInfo.bankAccount} ({coupleInfo.bankName?.toUpperCase()})</span>
                  </div>
                  {vietQrUrl && (
                    <img
                      src={vietQrUrl}
                      alt="VietQR"
                      crossOrigin="anonymous"
                      className="w-11 h-11 object-contain rounded border border-neutral-200"
                    />
                  )}
                </div>
              )}

              <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-mono">
                <Music className="w-3 h-3 text-neutral-500" />
                <span>Nhạc: {coupleInfo.customSong || template.audioTitle || 'Marry You'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
