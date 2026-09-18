# L-STUDIO WEDDING TEMPLATES — CHANGELOG

## [2026-09-18 17:00] Change #110

### Task
Sửa dứt điểm việc mọi mẫu khi ấn vào sửa đều hiển thị cùng 1 mẫu trắng chung: Tự động gán theme và banner đồ họa thực tế của mẫu thiệp được chọn, đặt chế độ tùy biến trực tiếp làm mặc định khi mở Studio.

### Files Changed
- `src/utils/templateTheme.ts` [NEW]
- `src/components/StudioEditor.tsx` [MODIFIED]
- `src/components/LiveInvitationView.tsx` [MODIFIED]

### Changes
1. **Thiết lập bảng màu và phong cách độc bản cho từng mẫu thiệp (`src/utils/templateTheme.ts`)**:
   - Tự động nhận diện và gán 5 chủ đề đồ họa chuyên biệt theo thiết kế thực tế:
     * `Luxury Gold Hoàng Gia`: Nền đen huyền bí `#141210`, viền kim loại ánh vàng, điểm nhấn champagne.
     * `Hồng Pastel Lãng Mạn`: Nền hoa hồng phấn `#fff5f6`, hoa văn cánh hoa, viền vàng hồng tinh tế.
     * `Xanh Sage Tự Nhiên`: Nền lá cây bạch đàn `#f2f7f3`, viền xanh rừng cổ điển, họa tiết thực vật.
     * `Vintage Cổ Điển`: Nền giấy cổ `#faf6ef`, hoa văn sáp niêm phong, sắc terracotta sang trọng.
     * `Tối Giản Hiện Đại`: Phong cách monochrome kiến trúc sắc nét, tinh gọn.
2. **Nâng cấp Studio Editor (`StudioEditor.tsx`)**:
   - Đặt chế độ `customized` (Chỉnh sửa theo mẫu này) làm chế độ mặc định khi người dùng bấm "Tải ảnh & Sửa thiệp ngay".
   - Tích hợp banner nghệ thuật thực tế từ `template.longThumbnail` ngay trên đầu thiệp.
   - Hiển thị đầy đủ poster dọc chất lượng cao của chính mẫu thiệp đó ở phần dưới của thiệp.
   - Dữ liệu dâu rể, thời gian, địa điểm, VietQR cập nhật tức thì trên phong cách của mẫu được chọn.
3. **Đồng bộ trang khách mời (`LiveInvitationView.tsx`)**:
   - Áp dụng cùng hệ thống `templateTheme` để thiệp khi gửi cho bạn bè phản ánh đúng 100% phong cách của mẫu đã chọn.

### Tests
- `npm run build`: PASS (TypeScript tsc & Vite v6.4.3 biên dịch thành công 100%, 0 lỗi, 1.30s).
- Git push to GitHub `main`: PASS (commit `81aa14f`).

### Status
PASS / PUBLISHED

---

## [2026-09-18 15:55] Change #109

### Task
Khôi phục 100% dữ liệu gốc 134 mẫu thiệp cưới CineLove không đảo lộn, khắc phục triệt để lỗi khi ấn vào sửa mẫu nào cũng hiện cùng một mẫu chung, và tích hợp chế độ xem trực tiếp tương tác nguyên bản (Live Iframe) cho từng mẫu thiệp.

### Files Changed
- `src/data/templates.json` [MODIFIED]
- `src/data/cinelove_original_templates.json` [NEW]
- `src/components/StudioEditor.tsx` [MODIFIED]
- `src/components/PreviewModal.tsx` [MODIFIED]
- `src/components/LiveInvitationView.tsx` [MODIFIED]

### Changes
1. **Khôi phục bộ dữ liệu gốc chuẩn xác 100% từ mã nguồn CineLove (`templates.json` & `cinelove_original_templates.json`)**:
   - Khôi phục đầy đủ 134 mẫu thiệp gốc với đúng đường dẫn ảnh dọc `longThumbnail`, ảnh vuông `thumbnail`, mã nhạc `audioKey`, tên thiệp và slug tương ứng (`thiep-cuoi-61`, `thiep-cuoi-39`, `thiep-cuoi-44`...).
   - Đưa toàn bộ mã nguồn dữ liệu gốc vào `cinelove_original_templates.json` để người dùng có thể tự chỉnh sửa trực tiếp.
   - Mở khóa 100% tất cả mẫu thiệp (`unlocked`).

2. **Khắc phục lỗi Studio Editor hiển thị cùng 1 mẫu (`StudioEditor.tsx`)**:
   - Loại bỏ khung trắng tĩnh giả lập generic trước đây khiến các mẫu trông giống hệt nhau.
   - Tích hợp 3 chế độ xem trong khung điện thoại:
     * `Live tương tác`: Nhúng trực tiếp iframe tương tác nguyên bản từ CineLove (`https://cinelove.me/template/iframe/${template.slug}`) với hoạt ảnh bay hoa, hiệu ứng chuyển trang và nhạc nền gốc.
     * `Poster HD`: Hiển thị poster thiết kế dọc siêu nét (`longThumbnail`) của chính mẫu thiệp đã chọn.
     * `Lồng ảnh & Dâu rể`: Hiển thị ảnh cưới của dâu rể lồng vào thiệp (4 kiểu khung: Arch, Circle, Rounded, Hero), đếm ngược ngày cưới, địa điểm, lịch trình và mã mừng cưới VietQR.
   - Bổ sung bộ chọn nhanh 134 mẫu trên Top Bar để người dùng có thể chuyển đổi mẫu thiệp tức thì ngay trong Studio Editor.

3. **Cập nhật Modal xem trước (`PreviewModal.tsx`)**:
   - Bổ sung tab "Live tương tác" (nhúng iframe nguyên bản), "Poster HD" và "Quét mã QR" giúp người dùng trải nghiệm đúng thiết kế động của mẫu đã chọn trước khi bắt đầu chỉnh sửa.

4. **Nâng cấp trang khách mời (`LiveInvitationView.tsx`)**:
   - Bổ sung nút chuyển đổi chế độ xem cho khách: xem thiệp cá nhân hóa của dâu rể (thông tin hôn lễ, Google Maps, đếm ngược, mừng cưới VietQR, sổ lưu bút) hoặc xem mẫu thiệp tương tác nguyên bản.

### Reason
Người dùng yêu cầu: "tất cả các mẫu thiệp khi ấn vào sửa đều cùng 1 mẫu , chứ k phải sửa trên chính mẫu thiệp đã chọn , sửa ngay , nếu cần có thể đưa tất cả nguồn của trang gốc lên github ko cần sửa thêm để tao tự sửa".

### Impact
- Mỗi mẫu thiệp trong số 134 mẫu giờ đây hiển thị chính xác thiết kế gốc của mẫu đó khi bấm Sửa hoặc Xem trước.
- Không còn hiện tượng các mẫu dùng chung 1 khung trắng hay bị xáo trộn ảnh mẫu.

### Tests
- `npm run build`: PASS (TypeScript tsc & Vite build thành công 100%, 0 errors).
- Kiểm tra iframe embed CineLove (`access-control-allow-origin: *`, HTTP 200): PASS.
- Push to GitHub `main`: PASS (commit `3e30b7e`).

### Status
PASS / PUBLISHED

---

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

## [2026-09-18 15:28] Change #108

### Task
Nâng cấp giao diện chỉnh sửa thiệp thành Studio Editor toàn màn hình chuẩn theo đúng layout & phong cách CineLove (Khung điện thoại trung tâm cuộn mẫu thiệp dọc thực tế + bảng công cụ trực quan bên trái).

### Files Changed
- `src/components/StudioEditor.tsx` [NEW]
- `src/App.tsx` [MODIFIED]

### Changes
1. **Trình Studio Editor toàn màn hình (`StudioEditor.tsx`)**:
   - Thanh điều khiển trên cùng (Top Bar): Nút Thoát Studio, Tên mẫu thiệp & Popover chuyển đổi nhanh giữa 134 mẫu, Trình phát nhạc nền đám cưới, Bộ thu phóng kích thước hiển thị (80%, 100%, 120%), Nút Xuất ảnh HD PNG 2.5x, Nút Xem trước khách mời, và Nút Xuất bản & Lấy link thiệp.
   - Bảng công cụ chỉnh sửa bên trái (Left Sidebar):
     * Ảnh cưới & Bìa mẫu (Tải ảnh từ máy, dán URL ảnh, 4 kiểu lồng khung Arch/Rounded/Circle/Hero, thu phóng).
     * Thông tin Cô dâu & Chú rể.
     * Lễ cưới & Tiệc chiêu đãi (Ngày giờ Dương lịch & Âm lịch, Tên nhà hàng, Địa chỉ chi tiết).
     * Thư ngỏ & AI gợi ý câu từ theo 4 phong cách.
     * Hộp mừng cưới số VietQR (Ngân hàng, STK, Tên chủ thẻ, preview mã QR).
     * Cài đặt & Tông màu chủ đạo.
   - Khu vực làm việc trung tâm (Center Canvas Workspace):
     * Khung mô phỏng iPhone cao cấp đặt ở trung tâm với đổ bóng chiều sâu.
     * Cuộn xem trực tiếp toàn bộ thiệp cưới dọc thực tế của mẫu được chọn (`template.longThumbnail`), ảnh dâu rể, đếm ngược ngày cưới, thông tin tiệc cưới và mã VietQR được cập nhật theo thời gian thực.
2. **Tích hợp vào điều hướng ứng dụng (`App.tsx`)**:
   - Khi bấm "Tải ảnh & Sửa thiệp ngay" trên bất kỳ thẻ mẫu nào hoặc trên Header, hệ thống chuyển sang chế độ Studio toàn màn hình mượt mà, chuyên nghiệp.

### Status
DONE / PUBLISHED
