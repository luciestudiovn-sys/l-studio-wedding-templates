# PROJECT STATUS — L-STUDIO WEDDING TEMPLATES

Project: L-Studio (Lucie Studio) Online Wedding Invitation Platform
Current Checkpoint: CP-103 (Authentic 134 CineLove Templates & Interactive Live Editor)
Date: 2026-09-18
Repository: https://github.com/luciestudiovn-sys/l-studio-wedding-templates
Live GitHub Pages URL: https://luciestudiovn-sys.github.io/l-studio-wedding-templates/

## Overview
L-Studio là nền tảng thiệp cưới trực tuyến tối giản, hiện đại và tinh tế. Toàn bộ 134 mẫu thiệp cưới đã được khôi phục 100% nguyên bản từ mã nguồn CineLove, tích hợp trình Studio Editor hiển thị chính xác theo từng mẫu thiết kế thực tế (Live iframe, Poster HD, Customizer), trình tạo link mời công khai, trình phát nhạc lãng mạn, mã VietQR mừng cưới và trang thiệp mời riêng biệt cho khách dự tiệc.

## Architecture
- Framework: React 18 + TypeScript + Vite 6
- Styling: Tailwind CSS (Fonts: Inter, Space Grotesk, JetBrains Mono)
- Icons: Lucide React
- Export: HTML-to-Image (PNG HD 2.5x)
- Dynamic QR: qrcode + VietQR.io API
- Hosting: GitHub Pages (Automated via GitHub Actions)

## Completed Features
- [x] Khôi phục toàn bộ 134 mẫu thiệp cưới chuẩn xác từ CineLove vào `templates.json` và lưu mã nguồn gốc tại `cinelove_original_templates.json`.
- [x] Mở khóa 100% tất cả mẫu thiệp cưới L-Studio không giới hạn.
- [x] Sửa triệt để lỗi khi bấm vào sửa mẫu nào cũng ra một mẫu trắng: Mỗi mẫu giờ đây hiển thị chính xác thiết kế của chính mẫu đó.
- [x] Studio Editor 3 chế độ: Live tương tác nguyên bản (iframe), Poster HD dọc, và Lồng ảnh dâu rể tùy biến.
- [x] Bộ chuyển đổi nhanh 134 mẫu thiệp ngay trên thanh điều khiển Top Bar của Studio Editor.
- [x] 4 kiểu lồng ảnh dâu rể nghệ thuật (Arch, Circle, Rounded, Hero Full) kèm zoom & phục hồi ảnh gốc.
- [x] Hộp mừng cưới số VietQR tích hợp sao chép STK 1 chạm.
- [x] Tạo link mời cưới công khai (không trỏ về localhost).
- [x] Màn hình thiệp cưới riêng biệt cho khách mời (`LiveInvitationView`) kèm đếm ngược, Google Maps, thư ngỏ, mừng cưới VietQR, sổ lưu bút RSVP và chế độ xem mẫu gốc tương tác.
- [x] Tự động triển khai CI/CD qua GitHub Actions lên GitHub Pages.

## Known Issues
- Không có.

## Next Recommended Tasks
- Tùy chọn thêm album ảnh cưới phụ (Wedding Photo Gallery) cho trang khách mời.
- Bổ sung tùy chọn xuất thiệp dưới dạng file PDF in ấn 2 mặt.
