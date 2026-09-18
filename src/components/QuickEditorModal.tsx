import React, { useState, useMemo } from 'react';
import { X, Sparkles, Check, Calendar, MapPin, Music, Copy, Wand2, Bot, CreditCard, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
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

export const QuickEditorModal: React.FC<QuickEditorModalProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo>({
    groomName: 'Nguyễn Hoàng Nam',
    brideName: 'Trần Mai Linh',
    weddingDate: '2026-10-25',
    weddingTime: '11:30',
    lunarDate: '15 tháng 09 năm Bính Ngọ',
    venueName: 'Trung Tâm Tiệc Cưới White Palace',
    venueAddress: '194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh',
    invitationMessage: 'Sự hiện diện của quý khách là niềm vinh hạnh lớn nhất cho gia đình chúng tôi!',
    bankName: 'vietcombank',
    bankAccount: '9988776655',
    bankOwner: 'NGUYEN HOANG NAM',
  });

  const [copied, setCopied] = useState(false);
  const [aiToneSelected, setAiToneSelected] = useState<string>('');
  const [showBankBox, setShowBankBox] = useState<boolean>(true);

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
      particleCount: 90,
      spread: 65,
      origin: { y: 0.6 }
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyAiPreset = (preset: typeof AI_MESSAGE_PRESETS[0]) => {
    const generated = preset.msg(coupleInfo.groomName, coupleInfo.brideName);
    setCoupleInfo((prev) => ({ ...prev, invitationMessage: generated }));
    setAiToneSelected(preset.tone);
  };

  const imgUrl = getAssetUrl(template.longThumbnail || template.thumbnail);

  // VietQR URL generator
  const vietQrUrl = coupleInfo.bankAccount
    ? `https://img.vietqr.io/image/${coupleInfo.bankName || 'vietcombank'}-${coupleInfo.bankAccount}-compact.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(coupleInfo.groomName || 'chu re')}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT: Input Form for Personalization */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 overflow-y-auto border-r border-neutral-200">
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-xs font-mono mb-2 border border-neutral-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>L-STUDIO CUSTOMIZER &bull; {template.templateName}</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 font-display">
              Cá nhân hóa thiệp cưới của bạn
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Điền thông tin và theo dõi bản xem trước cập nhật ngay lập tức ở cột bên phải.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Groom & Bride Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Tên Chú Rể
                </label>
                <input
                  type="text"
                  value={coupleInfo.groomName}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, groomName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                  placeholder="Nguyễn Hoàng Nam"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Tên Cô Dâu
                </label>
                <input
                  type="text"
                  value={coupleInfo.brideName}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, brideName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                  placeholder="Trần Mai Linh"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-700" /> Ngày tổ chức hôn lễ
                </label>
                <input
                  type="date"
                  value={coupleInfo.weddingDate}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm font-mono"
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
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm font-mono"
                  placeholder="11:30"
                />
              </div>
            </div>

            {/* Venue Name & Address */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-700" /> Địa điểm tiệc cưới
                </label>
                <input
                  type="text"
                  value={coupleInfo.venueName}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, venueName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                  placeholder="Trung tâm tiệc cưới White Palace..."
                />
              </div>
              <input
                type="text"
                value={coupleInfo.venueAddress}
                onChange={(e) => setCoupleInfo({ ...coupleInfo, venueAddress: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                placeholder="194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM"
              />
            </div>

            {/* AI Assistant for Invitation Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Lời nhắn gửi khách mời
                </label>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
                  <Bot className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Assistant Tones:</span>
                </div>
              </div>

              {/* AI Presets Quick Select */}
              <div className="flex flex-wrap gap-1.5 mb-2">
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
                rows={2}
                value={coupleInfo.invitationMessage}
                onChange={(e) => setCoupleInfo({ ...coupleInfo, invitationMessage: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm leading-relaxed"
                placeholder="Sự hiện diện của quý khách..."
              />
            </div>

            {/* Hộp mừng cưới VietQR Toggle */}
            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowBankBox(!showBankBox)}
                className="flex items-center justify-between w-full text-xs font-semibold text-neutral-800 hover:text-neutral-950 py-1"
              >
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Hộp mừng cưới số (Mã VietQR chuyển khoản)</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {showBankBox ? 'Thu gọn' : 'Mở rộng'}
                </span>
              </button>

              {showBankBox && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 animate-fade-in">
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-0.5">Ngân hàng</label>
                    <select
                      value={coupleInfo.bankName}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, bankName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
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
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                      placeholder="Số tài khoản..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-0.5">Chủ tài khoản</label>
                    <input
                      type="text"
                      value={coupleInfo.bankOwner}
                      onChange={(e) => setCoupleInfo({ ...coupleInfo, bankOwner: e.target.value.toUpperCase() })}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs uppercase font-mono"
                      placeholder="Tên chủ thẻ..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 mt-4 border-t border-neutral-200 flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-xs sm:text-sm font-display"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã tạo link mời cưới thành công!' : 'Lưu & Sao chép link thiệp'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Live Visual Card Simulation */}
        <div className="w-full lg:w-1/2 bg-neutral-50 p-6 sm:p-8 flex flex-col items-center justify-center overflow-y-auto">
          <div className="text-center mb-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-bold">
              LIVE PREVIEW &bull; L-STUDIO
            </span>
          </div>

          {/* Minimalist Mobile Card Preview */}
          <div className="w-[300px] bg-white rounded-2xl shadow-lg border border-neutral-200/80 overflow-hidden relative">
            {/* Top decorative header */}
            <div className="relative h-36 bg-neutral-100 flex flex-col items-center justify-center p-4 text-center border-b border-neutral-200">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-medium mb-1">
                Save The Date
              </span>
              <h4 className="text-lg font-bold text-neutral-900 font-display">
                {coupleInfo.groomName || 'Chú rể'}
              </h4>
              <span className="text-neutral-400 text-xs font-serif my-0.5">&amp;</span>
              <h4 className="text-lg font-bold text-neutral-900 font-display">
                {coupleInfo.brideName || 'Cô dâu'}
              </h4>

              {/* Countdown badge */}
              {daysRemaining !== null && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-neutral-900 text-white text-[9px] font-mono">
                  Còn {daysRemaining} ngày
                </div>
              )}
            </div>

            {/* Template image */}
            <div className="h-36 overflow-hidden relative">
              <img
                src={imgUrl}
                alt="Template Preview"
                className="w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            {/* Wedding Information */}
            <div className="p-4 text-center space-y-2 bg-white text-xs">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-mono font-medium">
                {coupleInfo.weddingTime} &bull; {coupleInfo.weddingDate}
              </div>

              <div>
                <p className="font-semibold text-neutral-900 text-xs">
                  {coupleInfo.venueName}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1 font-sans">
                  {coupleInfo.venueAddress}
                </p>
              </div>

              <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] italic text-neutral-600 leading-relaxed">
                &ldquo;{coupleInfo.invitationMessage}&rdquo;
              </div>

              {/* VietQR Bank Gift Box simulation */}
              {coupleInfo.bankAccount && (
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-left px-1">
                  <div className="text-[10px]">
                    <span className="block font-semibold text-neutral-800">Hộp mừng cưới số</span>
                    <span className="font-mono text-neutral-500">{coupleInfo.bankAccount}</span>
                  </div>
                  {vietQrUrl && (
                    <img
                      src={vietQrUrl}
                      alt="VietQR"
                      className="w-10 h-10 object-contain rounded border border-neutral-200"
                    />
                  )}
                </div>
              )}

              <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-mono">
                <Music className="w-3 h-3 text-neutral-500" />
                <span>Nhạc nền: {template.audioTitle || 'Marry You'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
