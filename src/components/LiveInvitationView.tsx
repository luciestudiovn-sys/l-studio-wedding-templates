import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Heart, Calendar, Music, VolumeX, Copy, Check,
  Share2, ArrowLeft, Send, Sparkles, Navigation, Clock, CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleInfo, Template } from '../types/template';
import { getAssetUrl, getAudioUrl } from '../utils/formatters';
import { getTemplateTheme } from '../utils/templateTheme';

interface LiveInvitationViewProps {
  template: Template;
  coupleInfo: CoupleInfo;
  photoPlacement?: 'arch' | 'circle' | 'rounded' | 'hero';
  onBackToStudio: () => void;
}

interface GuestWish {
  id: string;
  name: string;
  attending: boolean;
  guestsCount: number;
  message: string;
  time: string;
}

export const LiveInvitationView: React.FC<LiveInvitationViewProps> = ({
  template,
  coupleInfo,
  photoPlacement = 'arch',
  onBackToStudio,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'custom' | 'original'>('custom');

  // Guest RSVP Form
  const [guestName, setGuestName] = useState<string>('');
  const [guestAttending, setGuestAttending] = useState<boolean>(true);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [guestMessage, setGuestMessage] = useState<string>('');
  const [wishes, setWishes] = useState<GuestWish[]>([
    {
      id: 'w1',
      name: 'Nguyễn Văn Hùng',
      attending: true,
      guestsCount: 2,
      message: 'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long, mãi mãi yêu thương nhau như ngày đầu nhé!',
      time: '10 phút trước',
    },
    {
      id: 'w2',
      name: 'Phương Thảo & Minh Đức',
      attending: true,
      guestsCount: 2,
      message: 'Chúc mừng hạnh phúc Nam & Linh! Hẹn gặp hai bạn ở ngày vui trọng đại!',
      time: '1 giờ trước',
    },
  ]);

  // Load saved wishes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`l_studio_wishes_${template.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWishes(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load guest wishes', e);
    }
  }, [template.id]);

  // Wedding Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const targetDateStr = `${coupleInfo.weddingDate || '2026-10-25'}T${coupleInfo.weddingTime || '11:30'}:00`;
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [coupleInfo.weddingDate, coupleInfo.weddingTime]);

  // Music setup
  const audioSrc = coupleInfo.customAudioUrl || getAudioUrl(template.audioKey);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio autoplay blocked', err);
      });
    }
  };

  const handleCopyBank = () => {
    if (!coupleInfo.bankAccount) return;
    navigator.clipboard.writeText(coupleInfo.bankAccount);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    confetti({ particleCount: 80, spread: 60 });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMessage.trim()) {
      alert('Vui lòng nhập họ tên và lời chúc của bạn');
      return;
    }

    const newWish: GuestWish = {
      id: Date.now().toString(),
      name: guestName.trim(),
      attending: guestAttending,
      guestsCount: guestCount,
      message: guestMessage.trim(),
      time: 'Vừa xong',
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem(`l_studio_wishes_${template.id}`, JSON.stringify(updated));
    } catch (err) {}

    setGuestName('');
    setGuestMessage('');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
    });
  };

  // Google Maps link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${coupleInfo.venueName}, ${coupleInfo.venueAddress}`
  )}`;

  // Google Calendar link
  const calendarDate = (coupleInfo.weddingDate || '2026-10-25').replace(/-/g, '');
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Lễ Cưới: ${coupleInfo.groomName} & ${coupleInfo.brideName}`
  )}&dates=${calendarDate}T040000Z/${calendarDate}T070000Z&details=${encodeURIComponent(
    coupleInfo.invitationMessage || 'Mời bạn đến chung vui cùng gia đình chúng tôi!'
  )}&location=${encodeURIComponent(coupleInfo.venueAddress || coupleInfo.venueName)}`;

  const templateCoverImg = getAssetUrl(template.longThumbnail || template.thumbnail);
  const displayPhoto = coupleInfo.coverImage || templateCoverImg;

  const vietQrUrl = coupleInfo.bankAccount
    ? `https://img.vietqr.io/image/${coupleInfo.bankName || 'vietcombank'}-${coupleInfo.bankAccount}-compact.png?amount=0&addInfo=Mung%20cuoi%20${encodeURIComponent(
        `${coupleInfo.groomName} ${coupleInfo.brideName}`
      )}`
    : '';

  // Theme styling based on template and couple choice
  const templateTheme = useMemo(() => getTemplateTheme(template), [template]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${templateTheme.bgGradient} ${templateTheme.textColor} ${templateTheme.fontFamily} selection:bg-neutral-200 pb-24`}>
      {/* Hidden HTML Audio element */}
      <audio ref={audioRef} src={audioSrc} loop preload="auto" />

      {/* Floating Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/70 shadow-sm transition-all">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 py-1 px-2.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>L-Studio</span>
          </button>

          <div className="text-center">
            <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold block">
              THIỆP BÁO HỶ ONLINE
            </span>
            <span className="text-xs font-bold font-display text-neutral-900 truncate block max-w-[170px]">
              {coupleInfo.groomName} &amp; {coupleInfo.brideName}
            </span>
          </div>

          {/* Music button */}
          <button
            onClick={togglePlayAudio}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-neutral-900 text-white shadow-md animate-spin-slow'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
            title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc cưới lãng mạn'}
          >
            {isPlaying ? <Music className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mode Switcher Pill */}
      <div className="fixed top-16 inset-x-0 z-30 flex justify-center pointer-events-none">
        <div className="pointer-events-auto inline-flex p-1 bg-white/95 backdrop-blur-md rounded-full border border-neutral-200 shadow-md text-xs font-semibold">
          <button
            onClick={() => setViewMode('custom')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              viewMode === 'custom' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Thiệp Dâu Rể &amp; Mừng Cưới
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              viewMode === 'original' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mẫu gốc tương tác</span>
          </button>
        </div>
      </div>

      {viewMode === 'original' ? (
        <div className="max-w-md mx-auto pt-28 px-4 pb-20 flex flex-col items-center">
          <div className="w-full h-[780px] sm:h-[820px] bg-neutral-950 rounded-[44px] p-2.5 shadow-2xl border-2 border-neutral-700/80 flex flex-col relative">
            {/* Dynamic island notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-between px-2.5">
              <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse" />
            </div>

            <div className="w-full h-full bg-white rounded-[36px] overflow-hidden relative">
              <iframe
                src={`https://cinelove.me/template/iframe/${template.slug}`}
                title={template.templateName}
                className="w-full h-full border-0 bg-white"
                allow="autoplay; clipboard-write"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-500 text-center font-mono">
            Hiển thị giao diện tương tác nguyên bản của mẫu: <strong className="text-neutral-800">{template.templateName}</strong>
          </p>
        </div>
      ) : (
        /* Main Guest Invitation Scrollable Container (Mobile-first width max-w-lg) */
        <main className="max-w-md mx-auto pt-28 px-4 space-y-6">
        {/* HERO TITLE & MONOGRAM */}
        <section className="text-center pt-4 pb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md border border-neutral-200/80 mb-3">
            <span className="font-display font-bold text-lg tracking-tighter text-neutral-900">
              {coupleInfo.groomName?.charAt(0) || 'N'}
              <span className="text-neutral-400 font-serif font-normal">&amp;</span>
              {coupleInfo.brideName?.charAt(0) || 'L'}
            </span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-bold mb-1">
            SAVE THE DATE &bull; LỄ THÀNH HÔN
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-neutral-900 tracking-tight leading-snug">
            {coupleInfo.groomName}
            <span className="block text-neutral-400 font-serif font-light text-xl my-0.5">&amp;</span>
            {coupleInfo.brideName}
          </h1>

          <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 text-white shadow-sm">
            {coupleInfo.weddingDate} &bull; {coupleInfo.weddingTime}
          </div>
        </section>

        {/* COUNTDOWN TIMER */}
        <section className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-neutral-200 shadow-sm text-center">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block mb-2 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Đếm ngược ngày trọng đại</span>
          </span>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-100">
              <span className="block text-xl font-bold font-mono text-neutral-900">{timeLeft.days}</span>
              <span className="text-[10px] text-neutral-500 font-sans">Ngày</span>
            </div>
            <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-100">
              <span className="block text-xl font-bold font-mono text-neutral-900">{timeLeft.hours}</span>
              <span className="text-[10px] text-neutral-500 font-sans">Giờ</span>
            </div>
            <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-100">
              <span className="block text-xl font-bold font-mono text-neutral-900">{timeLeft.minutes}</span>
              <span className="text-[10px] text-neutral-500 font-sans">Phút</span>
            </div>
            <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-100">
              <span className="block text-xl font-bold font-mono text-neutral-900">{timeLeft.seconds}</span>
              <span className="text-[10px] text-neutral-500 font-sans">Giây</span>
            </div>
          </div>
        </section>

        {/* AUTHENTIC TEMPLATE DESIGN & COUPLE PHOTO CANVAS */}
        <section className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-300/80">
          {/* Template Badge */}
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{template.templateName}</span>
          </div>

          {/* Couple Photo Container styled by placement */}
          <div className="relative w-full bg-neutral-100 overflow-hidden flex items-center justify-center p-4">
            {photoPlacement === 'arch' ? (
              <div className="w-[85%] aspect-[3/4] rounded-t-full rounded-b-xl overflow-hidden shadow-lg border-4 border-white relative">
                <img
                  src={displayPhoto}
                  alt="Ảnh Dâu Rể"
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
              </div>
            ) : photoPlacement === 'circle' ? (
              <div className="w-64 h-64 rounded-full overflow-hidden shadow-lg border-4 border-white relative">
                <img
                  src={displayPhoto}
                  alt="Ảnh Dâu Rể"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : photoPlacement === 'rounded' ? (
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md border-2 border-white/80 relative">
                <img
                  src={displayPhoto}
                  alt="Ảnh Dâu Rể"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ) : (
              /* Hero Full */
              <div className="w-full aspect-[3/4] overflow-hidden relative">
                <img
                  src={displayPhoto}
                  alt="Ảnh Dâu Rể"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}
          </div>

          {/* Wedding Invitation Card Typography Overlay / Details */}
          <div className="p-6 text-center space-y-4 bg-white">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-neutral-400 font-bold block mb-1">
                LỜI NGỎ YÊU THƯƠNG
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-neutral-700 leading-relaxed max-w-sm mx-auto px-2">
                &ldquo;{coupleInfo.invitationMessage}&rdquo;
              </p>
            </div>

            <div className="w-12 h-px bg-neutral-200 mx-auto" />

            {/* Ceremony Details */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                HÔN LỄ ĐƯỢC TỔ CHỨC VÀO LÚC
              </span>
              <p className="text-xl font-bold font-display text-neutral-900">
                {coupleInfo.weddingTime} &bull; {coupleInfo.weddingDate}
              </p>
              {coupleInfo.lunarDate && (
                <p className="text-xs text-neutral-500 font-serif italic">
                  (Tức ngày {coupleInfo.lunarDate})
                </p>
              )}
            </div>

            {/* Venue Details */}
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center space-y-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                ĐỊA ĐIỂM TỔ CHỨC
              </span>
              <h3 className="text-sm font-bold font-display text-neutral-900">
                {coupleInfo.venueName}
              </h3>
              <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                {coupleInfo.venueAddress}
              </p>

              <div className="pt-2 flex items-center justify-center gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-800 shadow-sm transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chỉ đường Google Maps</span>
                </a>

                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-800 shadow-sm transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Thêm vào lịch</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAM TIMELINE */}
        <section className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 text-center font-mono">
            CHƯƠNG TRÌNH HÔN LỄ
          </h3>

          <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
            <div className="relative pl-8">
              <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-neutral-900 border-2 border-white" />
              <span className="text-xs font-bold font-mono text-neutral-900">10:30</span>
              <p className="text-xs font-semibold text-neutral-800">Đón khách &amp; Chụp ảnh lưu niệm</p>
              <p className="text-[11px] text-neutral-500">Cùng ghi lại những khoảnh khắc đẹp tại sảnh tiệc</p>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white" />
              <span className="text-xs font-bold font-mono text-neutral-900">{coupleInfo.weddingTime}</span>
              <p className="text-xs font-semibold text-neutral-800">Cử hành Hôn Lễ Thành Hôn</p>
              <p className="text-[11px] text-neutral-500">Nghi thức trao nhẫn cưới &amp; cắt bánh chúc mừng</p>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-neutral-900 border-2 border-white" />
              <span className="text-xs font-bold font-mono text-neutral-900">12:00</span>
              <p className="text-xs font-semibold text-neutral-800">Khai tiệc mừng chiêu đãi</p>
              <p className="text-[11px] text-neutral-500">Thưởng thức tiệc cưới và chung vui cùng hai gia đình</p>
            </div>
          </div>
        </section>

        {/* DIGITAL WEDDING GIFT BOX & VIETQR */}
        {coupleInfo.bankAccount && (
          <section className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <div className="text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-bold block mb-1">
                GỬI LỜI CHÚC TỪ XA
              </span>
              <h3 className="text-sm font-bold font-display text-neutral-900 flex items-center justify-center gap-1.5">
                <CreditCard className="w-4 h-4 text-neutral-700" />
                <span>Hộp Mừng Cưới Số &bull; VietQR</span>
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-xs mx-auto">
                Quý khách có thể gửi lời chúc phúc và tiền mừng trực tiếp qua mã QR ngân hàng
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col items-center text-center space-y-3">
              {vietQrUrl && (
                <div className="p-2 bg-white rounded-xl shadow-sm border border-neutral-200 inline-block">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Mừng Cưới"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              )}

              <div className="space-y-0.5">
                <p className="text-xs text-neutral-500">Ngân hàng: <strong>{coupleInfo.bankName?.toUpperCase()}</strong></p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-mono font-bold text-neutral-900">{coupleInfo.bankAccount}</span>
                  <button
                    onClick={handleCopyBank}
                    className="p-1 rounded hover:bg-neutral-200 text-neutral-600 transition-colors"
                    title="Sao chép STK"
                  >
                    {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs font-semibold text-neutral-800 uppercase font-mono">
                  CHỦ TK: {coupleInfo.bankOwner}
                </p>
              </div>

              <button
                onClick={handleCopyBank}
                className="w-full py-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 transition-colors shadow-subtle"
              >
                {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBank ? 'Đã sao chép số tài khoản!' : 'Sao chép số tài khoản'}</span>
              </button>
            </div>
          </section>
        )}

        {/* GUESTBOOK & RSVP (XÁC NHẬN THAM DỰ & LỜI CHÚC) */}
        <section className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-bold block mb-1">
              SỔ LƯU BÚT ONLINE
            </span>
            <h3 className="text-sm font-bold font-display text-neutral-900 flex items-center justify-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Xác Nhận Tham Dự &amp; Gửi Lời Chúc</span>
            </h3>
          </div>

          <form onSubmit={handleSendWish} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Tên của bạn *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nhập họ và tên hoặc biệt danh..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Sự hiện diện
                </label>
                <div className="flex rounded-xl bg-neutral-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setGuestAttending(true)}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      guestAttending ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                    }`}
                  >
                    Tham dự ❤️
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestAttending(false)}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      !guestAttending ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                    }`}
                  >
                    Từ xa 💐
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Số người tham dự
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                >
                  <option value={1}>1 người (Tôi)</option>
                  <option value={2}>2 người (+ Người thương)</option>
                  <option value={3}>3 người (+ Gia đình)</option>
                  <option value={4}>4 người (+ Gia đình)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Lời chúc gửi dâu rể *
              </label>
              <textarea
                required
                rows={3}
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                placeholder="Viết lời chúc phúc gửi tới cô dâu & chú rể..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi lời chúc phúc</span>
            </button>
          </form>

          {/* List of guest wishes */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              LỜI CHÚC ĐÃ GỬI ({wishes.length})
            </span>
            <div className="space-y-2 max-h-60 overflow-y-auto preview-scrollbar pr-1">
              {wishes.map((w) => (
                <div key={w.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">{w.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{w.time}</span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed font-sans">{w.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER & BRAND */}
        <footer className="text-center pt-6 pb-12 space-y-3">
          <p className="text-xs text-neutral-500 font-display">
            Cảm ơn quý khách đã gửi lời chúc và chia sẻ niềm vui cùng gia đình chúng tôi!
          </p>

          <div className="pt-3">
            <button
              onClick={onBackToStudio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-300 text-neutral-700 text-xs font-medium hover:bg-neutral-50 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tạo thiệp cưới online miễn phí tại L-Studio</span>
            </button>
          </div>

          <p className="text-[10px] text-neutral-400 font-mono">
            &copy; {new Date().getFullYear()} L-Studio Wedding Platform &bull; Made with Love
          </p>
        </footer>
      </main>
      )}

      {/* Floating Bottom Quick Action Bar */}
      <aside aria-label="Hành động nhanh" className="fixed bottom-3 inset-x-4 max-w-md mx-auto z-40 bg-neutral-900/90 backdrop-blur-md rounded-2xl p-2 px-3 shadow-2xl flex items-center justify-between text-white text-xs border border-white/10">
        <button
          onClick={togglePlayAudio}
          className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl hover:bg-white/10 transition-colors"
        >
          {isPlaying ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[11px] truncate max-w-[110px]">
                {coupleInfo.customSong || template.audioTitle || 'Đang phát nhạc'}
              </span>
            </>
          ) : (
            <>
              <Music className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[11px] text-neutral-300">Bật nhạc nền</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareLink}
          className="py-1.5 px-3 bg-white text-neutral-900 font-semibold rounded-xl flex items-center gap-1.5 hover:bg-neutral-100 transition-colors shadow-sm"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Đã sao chép link!' : 'Chia sẻ thiệp'}</span>
        </button>
      </aside>
    </div>
  );
};
