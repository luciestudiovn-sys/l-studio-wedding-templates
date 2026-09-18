# PROJECT STATUS — L-STUDIO WEDDING TEMPLATES

Project: L-Studio (Lucie Studio) Online Wedding Invitation Platform
Current Checkpoint: CP-102 (Realistic Template Customizer & Live Invitation Experience)
Date: 2026-09-18
Repository: https://github.com/luciestudiovn-sys/l-studio-wedding-templates
Live GitHub Pages URL: https://luciestudiovn-sys.github.io/l-studio-wedding-templates/

## Overview
L-Studio là nền tảng thiệp cưới trực tuyến tối giản, hiện đại và tinh tế. Toàn bộ 134 mẫu thiệp cưới đã được mở khóa 100%, tích hợp trình chỉnh sửa theo từng mẫu thiết kế thực tế, trình tạo link mời công khai, trình phát nhạc lãng mạn, mã VietQR mừng cưới và trang thiệp mời riêng biệt cho khách dự tiệc.

## Architecture
- Framework: React 18 + TypeScript + Vite 6
- Styling: Tailwind CSS (Fonts: Inter, Space Grotesk, JetBrains Mono)
- Icons: Lucide React
- Export: HTML-to-Image (PNG HD 2.5x)
- Dynamic QR: qrcode + VietQR.io API
- Hosting: GitHub Pages (Automated via GitHub Actions)

## Completed Features
- [x] Mở khóa toàn bộ 134 mẫu thiệp cưới L-Studio không giới hạn.
- [x] Đảo ảnh mẫu, làm mới phong cách tối giản, lược bỏ hoàn toàn dấu vết CineLove.
- [x] Bộ lọc phong cách (Minimalist, Hàn Quốc, Luxury Gold, Cổ điển, Vintage, Floral...).
- [x] Trình mô phỏng iPhone 16 Pro kèm mã QR và phát nhạc trực tiếp.
- [x] Trình tùy biến thiệp (`QuickEditorModal`) render trực tiếp trên bố cục mẫu thiệp thực tế đã chọn.
- [x] 4 kiểu lồng ảnh dâu rể nghệ thuật (Arch, Circle, Rounded, Hero Full) kèm zoom & phục hồi ảnh gốc.
- [x] Hộp mừng cưới số VietQR tích hợp sao chép STK 1 chạm.
- [x] Tạo link mời cưới công khai (không trỏ về localhost).
- [x] Màn hình thiệp cưới riêng biệt cho khách mời (`LiveInvitationView`) kèm đếm ngược, Google Maps, thư ngỏ và sổ lưu bút RSVP.
- [x] Tự động triển khai CI/CD qua GitHub Actions lên GitHub Pages.

## Known Issues
- Không có.

## Next Recommended Tasks
- Tùy chọn thêm album ảnh cưới phụ (Wedding Photo Gallery) cho trang khách mời.
- Tích hợp thêm mẫu thiệp mời sinh nhật và kỷ niệm ngày cưới.
