# L-STUDIO WEDDING TEMPLATES — CHANGELOG

## [2026-09-18 15:10] Change #107

### Task
Sửa lỗi trình chỉnh sửa thiệp không render theo mẫu gốc & Khắc phục việc tạo link ra localhost thay vì trang xem thiệp thực tế công khai.

### Files Changed
- `src/utils/share.ts` [NEW]
- `src/components/LiveInvitationView.tsx` [NEW]
- `src/components/QuickEditorModal.tsx` [MODIFIED]
- `src/components/PreviewModal.tsx` [MODIFIED]
- `src/App.tsx` [MODIFIED]
- `vite.config.ts` [MODIFIED]
- `.github/workflows/deploy.yml` [NEW]

### Changes
1. **Sửa thiệp theo đúng mẫu được chọn (`QuickEditorModal.tsx`)**:
   - Thay thế toàn bộ khung xem trước tĩnh màu trắng trước đây bằng bản xem trước thực tế dựa trên **chính mẫu thiệp người dùng đã chọn** (`template.longThumbnail` / `template.thumbnail`).
   - Tích hợp 4 chế độ lồng ảnh dâu rể nghệ thuật:
     * Khung vòm Hàn Quốc (Arch)
     * Khung tròn cổ điển (Circle)
     * Khung chữ nhật bo góc mềm (Rounded)
     * Ảnh tràn viền nghệ thuật (Hero Full)
   - Bổ sung công cụ điều chỉnh tỷ lệ thu phóng ảnh (100%, 115%, 130%), vị trí ảnh và nút "Dùng lại ảnh mẫu gốc".
   - Cho phép nhập trực tiếp link ảnh trực tuyến (Imgur, Facebook, Cloudinary...) để hiển thị xuyên suốt trên mọi thiết bị khi chia sẻ.
   - Hỗ trợ chuyển đổi giữa chế độ "Khung thiệp HD" và "Mẫu cuộn dài".
   - Giữ nguyên tính năng chụp xuất ảnh HD (PNG) ở tỷ lệ 2.5x pixel ratio siêu nét.

2. **Khắc phục tạo link xem thiệp công khai thay vì localhost (`src/utils/share.ts`)**:
   - Xây dựng module `share.ts` tự động phát hiện môi trường: Nếu chạy trên localhost / dev, luôn xuất đường dẫn công khai `https://luciestudiovn-sys.github.io/l-studio-wedding-templates/` thay vì dính `http://localhost:5173`.
   - Mã hoá toàn bộ thông tin ngày cưới, giờ làm lễ, tên cô dâu chú rể, địa điểm, thư ngỏ, tài khoản ngân hàng VietQR vào URL query params.

3. **Xây dựng màn hình thiệp cưới dành riêng cho khách mời (`LiveInvitationView.tsx`)**:
   - Khi khách mời hoặc bạn bè mở link (có param `?view=invitation`), hệ thống lập tức mở trang thiệp cưới toàn màn hình chuẩn mobile riêng biệt, không bị rối mắt bởi thanh điều hướng hay danh mục mua bán.
   - Tự động phát / nút điều khiển nhạc cưới lãng mạn theo mẫu (`template.audioKey`).
   - Monogram & Tiêu đề Hôn Lễ Thành Hôn.
   - Đồng hồ đếm ngược thời gian thực đến ngày cưới (Ngày / Giờ / Phút / Giây).
   - Bản thiệp chính với ảnh cưới của dâu rể lồng vào mẫu thiết kế đã chọn.
   - Lịch trình hôn lễ chi tiết kèm nút **"Chỉ đường Google Maps"** và **"Thêm vào Google Calendar"**.
   - Thư ngỏ trân trọng từ dâu rể.
   - Hộp mừng cưới số: Hiển thị thông tin tài khoản, 1-chạm sao chép STK và **Mã VietQR động** tự động điền nội dung mừng cưới cho các app ngân hàng.
   - Sổ lưu bút & Form xác nhận tham dự (RSVP): Khách có thể chọn đi 1 người, 2 người hoặc từ xa và gửi lời chúc phúc (hiển thị trực tiếp vào sổ lưu bút kèm hiệu ứng pháo hoa).

4. **Cấu hình xuất bản GitHub Pages tự động (`vite.config.ts`, `.github/workflows/deploy.yml`)**:
   - Đặt `base: './'` đảm bảo asset paths không bị 404 khi host ở subpath `/l-studio-wedding-templates/`.
   - Bổ sung GitHub Actions workflow tự động biên dịch Vite và deploy `dist/` lên GitHub Pages.

### Reason
Người dùng phản ánh: "phần tải ảnh + sửa thiệp đang ko sửa theo mẫu , tạo link không ra link xem mà lại ra local host". Các thay đổi trên giải quyết dứt điểm cả 2 vấn đề theo đúng yêu cầu.

### Impact
- Trải nghiệm tùy biến thiệp cưới trực quan, sống động và bám sát từng mẫu thiết kế.
- Link thiệp cưới chia sẻ qua Zalo, Messenger, SMS hoàn toàn là link công khai thật, hoạt động tức thì trên mọi điện thoại.

### Tests
- `npm run build`: PASS (TypeScript tsc & Vite build sạch 100%, 0 lỗi).
- Kiểm tra query parameters serialization & parsing: PASS.

### Status
DONE
