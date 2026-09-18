import React from 'react';
import { Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="lien-he" className="bg-neutral-950 text-neutral-400 pt-14 pb-10 border-t border-neutral-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-neutral-900 flex items-center justify-center font-serif text-base font-bold">
                L
              </div>
              <span className="text-xl font-bold font-sans text-white tracking-tight">
                L-STUDIO
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Studio thiết kế thiệp cưới online phong cách tối giản &amp; hiện đại.
              Tất cả mẫu thiệp đã được mở khóa hoàn toàn để bạn tự do lựa chọn và tùy biến.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-neutral-300">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <a href="mailto:contact@l-studio.vn" className="hover:text-white transition-colors">
                contact@l-studio.vn
              </a>
            </div>
          </div>

          {/* Bộ sưu tập */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Mẫu thiệp L-Studio
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Mẫu thiệp cưới tối giản</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thiệp cưới hiện đại</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thiệp sinh nhật &amp; Thôi nôi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thiệp tốt nghiệp &amp; Sự kiện</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thiệp kỷ niệm</a></li>
            </ul>
          </div>

          {/* Dịch vụ & Hướng dẫn */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Dịch vụ &amp; Hướng dẫn
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Tạo thiệp theo yêu cầu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn gửi thiệp qua Zalo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cách viết lời mời đám cưới</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kinh nghiệm chuẩn bị cưới</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Pháp lý & Hỗ trợ */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Thông tin &amp; Hỗ trợ
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Về L-Studio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hỗ trợ khách hàng</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-3">
          <p>© 2026 L-Studio. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Thiết kế bởi</span>
            <span className="text-neutral-400 font-medium">L-Studio Wedding Design</span>
            <Heart className="w-3 h-3 text-neutral-400 fill-neutral-400 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
