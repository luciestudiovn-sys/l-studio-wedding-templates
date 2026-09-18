import React, { useState } from 'react';
import { X, Sparkles, Check, Calendar, MapPin, Music, Copy, Wand2, Bot } from 'lucide-react';
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
      `Khoảnh khắc ${g || 'chú rể'} và ${b || 'cô dâu'} hòa chung nhịp đập, chúng mình vô cùng hạnh phúc khi được nắm tay nhau bước vào lễ đường. Rất mong được đón tiếp bạn trong ngày vui thiêng liêng này!`,
  },
  {
    tone: 'Trang trọng',
    msg: () =>
      `Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi tại lễ thành hôn. Sự hiện diện và lời chúc phúc của quý vị là niềm vinh hạnh lớn lao nhất cho hai gia đình!`,
  },
  {
    tone: 'Tối giản & Tinh tế',
    msg: () =>
      `Một chặng đường mới mở ra với tình yêu thương và sự đồng hành. Chúng tôi chân thành mời bạn đến chứng kiến khoảnh khắc đặc biệt và sẻ chia niềm hạnh phúc bình dị này.`,
  },
  {
    tone: 'Thân mật & Trẻ trung',
    msg: () =>
      `Sau bao ngày tìm hiểu, chúng mình chính thức về chung một nhà! Hãy cùng đến nâng ly chúc mừng và quẩy hết mình trong bữa tiệc đặc biệt của chúng mình nhé!`,
  },
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
  });

  const [copied, setCopied] = useState(false);
  const [aiToneSelected, setAiToneSelected] = useState<string>('');

  if (!isOpen || !template) return null;

  const handleShare = () => {
    confetti({
      particleCount: 80,
      spread: 60,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
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
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tùy biến mẫu: {template.templateName}</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 font-serif">
              Thông tin thiệp cưới L-Studio
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Nhập tên Chú Rể, Cô Dâu và thời gian tiệc cưới để xem trực tiếp thiệp của bạn.
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
                  placeholder="Nguyễn Văn A"
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
                  placeholder="Trần Thị B"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-700" /> Ngày tổ chức
                </label>
                <input
                  type="date"
                  value={coupleInfo.weddingDate}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Giờ đón khách
                </label>
                <input
                  type="text"
                  value={coupleInfo.weddingTime}
                  onChange={(e) => setCoupleInfo({ ...coupleInfo, weddingTime: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                  placeholder="11:30"
                />
              </div>
            </div>

            {/* Venue Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-700" /> Địa điểm tiệc cưới
              </label>
              <input
                type="text"
                value={coupleInfo.venueName}
                onChange={(e) => setCoupleInfo({ ...coupleInfo, venueName: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                placeholder="Trung tâm tiệc cưới..."
              />
            </div>

            {/* Venue Address */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                value={coupleInfo.venueAddress}
                onChange={(e) => setCoupleInfo({ ...coupleInfo, venueAddress: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm"
                placeholder="Số nhà, Phường, Quận, Thành phố..."
              />
            </div>

            {/* AI Assistant for Invitation Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                  <span>Lời nhắn gửi khách mời</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                  <Bot className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI Trợ lý viết lời mời:</span>
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
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700'
                    }`}
                  >
                    <Wand2 className="w-3 h-3 text-amber-500" />
                    <span>{p.tone}</span>
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={coupleInfo.invitationMessage}
                onChange={(e) => setCoupleInfo({ ...coupleInfo, invitationMessage: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 focus:bg-white text-xs sm:text-sm leading-relaxed"
                placeholder="Sự hiện diện của quý khách..."
              />
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-neutral-200 flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all text-xs sm:text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã tạo liên kết mời cưới!' : 'Lưu & Sao chép link thiệp'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Live Visual Card Simulation */}
        <div className="w-full lg:w-1/2 bg-neutral-50 p-6 sm:p-8 flex flex-col items-center justify-center overflow-y-auto">
          <div className="text-center mb-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Bản xem trước tức thì &bull; L-Studio
            </span>
          </div>

          {/* Minimalist Mobile Card Preview */}
          <div className="w-[290px] bg-white rounded-2xl shadow-md border border-neutral-200/80 overflow-hidden relative">
            <div className="relative h-40 bg-neutral-100 flex flex-col items-center justify-center p-4 text-center border-b border-neutral-200">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium mb-1">
                Wedding Invitation
              </span>
              <h4 className="text-lg font-bold text-neutral-900 font-serif">
                {coupleInfo.groomName || 'Chú rể'}
              </h4>
              <span className="text-neutral-400 font-serif text-sm my-0.5">&amp;</span>
              <h4 className="text-lg font-bold text-neutral-900 font-serif">
                {coupleInfo.brideName || 'Cô dâu'}
              </h4>
            </div>

            <div className="h-40 overflow-hidden relative">
              <img
                src={imgUrl}
                alt="Template Preview"
                className="w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            <div className="p-4 text-center space-y-2 bg-white">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-medium">
                {coupleInfo.weddingTime} &bull; {coupleInfo.weddingDate}
              </div>

              <div>
                <p className="font-semibold text-neutral-800 text-xs">
                  {coupleInfo.venueName}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                  {coupleInfo.venueAddress}
                </p>
              </div>

              <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] italic text-neutral-600 leading-relaxed">
                &ldquo;{coupleInfo.invitationMessage}&rdquo;
              </div>

              <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                <Music className="w-3 h-3 text-neutral-600" />
                <span>Nhạc nền: {template.audioTitle || 'Marry You'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
