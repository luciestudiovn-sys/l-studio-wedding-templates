# CHECKPOINTS — L-STUDIO WEDDING TEMPLATES

## CHECKPOINT CP-103

Date: 2026-09-18
Status: STABLE
Version: 1.2.0
Git Branch: main (commit `3e30b7e`)

### Completed
- Khôi phục 100% dữ liệu 134 mẫu thiệp gốc nguyên bản từ CineLove (`templates.json` & `cinelove_original_templates.json`).
- Mở khóa toàn bộ 134 mẫu thiệp.
- Studio Editor hiển thị chính xác thiết kế của mẫu thiệp được chọn (Live tương tác iframe, Poster HD, Lồng ảnh & dâu rể tùy biến).
- Bổ sung bộ chuyển đổi nhanh 134 mẫu trên thanh Top Bar của Studio.
- Cập nhật PreviewModal với 3 tab: Live tương tác, Poster HD, Quét mã QR.
- Cập nhật LiveInvitationView với nút chuyển đổi giữa thiệp dâu rể và mẫu gốc tương tác.

### Tests
- `npm run build`: PASS (TypeScript tsc & Vite build thành công 100%, 0 errors).
- Đẩy mã nguồn lên GitHub: PASS.

---

## CHECKPOINT CP-102

Date: 2026-09-18
Status: STABLE
Version: 1.1.0
Git Branch: main

### Completed
- Render đúng mẫu thiệp cưới khi tải ảnh dâu rể & chỉnh sửa thông tin.
- Tạo đường dẫn chia sẻ công khai chuẩn GitHub Pages thay vì localhost.
- Xây dựng trang thiệp cưới trực tiếp cho khách mời (`LiveInvitationView`).
- Cấu hình CI/CD tự động deploy lên GitHub Pages với `base: './'`.

### Tests
- `npm run build`: PASS (0 errors, 1.00s).
- Query params parsing: PASS.

---

## CHECKPOINT CP-101

Date: 2026-09-18
Status: STABLE
Version: 1.0.0
Git Branch: main

### Completed
- Khởi tạo dự án L-Studio với 134 mẫu thiệp cưới mở khóa toàn bộ.
- Thiết lập giao diện tối giản theo phong cách Carstream/MBStore (Inter + Space Grotesk + JetBrains Mono).
- Mô phỏng iPhone 16 Pro, trình phát nhạc toàn cục, bộ lọc mẫu thiệp.
- Tạo repository `l-studio-wedding-templates` trên GitHub.
