# Hướng Dẫn Cấu Hình PostgreSQL Trong pgAdmin 4 & Khởi Chạy Backend - PETTO

Tài liệu này hướng dẫn bạn từng bước cách tạo Cơ sở dữ liệu trong **pgAdmin 4**, đồng bộ cấu trúc 16 bảng thông qua **Prisma Migration** và chạy thử nghiệm dữ liệu cục bộ.

---

## 1. Tạo Cơ Sở Dữ Liệu Trong pgAdmin 4

1.  **Mở pgAdmin 4** trên máy tính của bạn.
2.  Nhập mật khẩu Master password (nếu có) để kết nối vào pgAdmin.
3.  Ở danh sách bên trái (Browser), nhấn đúp vào **Servers** và nhập mật khẩu của tài khoản `postgres` (hoặc tài khoản quản trị của bạn) để kết nối.
4.  Nhấp chuột phải vào mục **Databases** -> chọn **Create** -> chọn **Database...**.
5.  Trong ô **Database**, nhập tên cơ sở dữ liệu là:
    ```text
    petto
    ```
6.  Chọn **Owner** mặc định là `postgres` (hoặc tài khoản quản trị của bạn).
7.  Nhấn nút **Save** để tạo database.

---

## 2. Cấu Hình Thông Tin Kết Nối Trên Backend

1.  Mở tệp `.env` nằm tại thư mục `petto_server/` trên máy tính của bạn.
2.  Tìm dòng cấu hình `DATABASE_URL` và chỉnh sửa mật khẩu khớp với mật khẩu của tài khoản PostgreSQL của bạn:
    ```env
    DATABASE_URL="postgresql://<tên_đăng_nhập>:<mật_khẩu_của_bạn>@localhost:5432/petto?schema=public"
    ```
    *Ví dụ: Nếu tài khoản của bạn là `postgres` và mật khẩu là `admin123`, cấu hình sẽ là:*
    ```env
    DATABASE_URL="postgresql://postgres:admin123@localhost:5432/petto?schema=public"
    ```

---

## 3. Chạy Khởi Tạo Bảng & Seed Dữ Liệu (Migrations & Seeds)

Sau khi đã tạo database và sửa file `.env`, bạn hãy mở terminal tại thư mục **`petto_server`** và thực hiện lần lượt 2 lệnh sau:

### Bước A: Chạy Migration để tạo cấu trúc 16 bảng
Lệnh này sẽ tự động đọc file `schema.prisma` và khởi tạo toàn bộ 16 bảng dữ liệu cùng các khóa ngoại, khóa chính và ràng buộc vào database `petto` của bạn:
```bash
npx prisma migrate dev --name init
```
*(Nếu hệ thống hỏi đặt tên migration, bạn có thể nhập `init` rồi nhấn Enter).*

### Bước B: Nạp dữ liệu giả lập (Seed Data)
Lệnh này sẽ chạy mã từ file `prisma/seed.ts` để nạp các sản phẩm, dịch vụ spa, tài khoản nhân viên (Admin/Staff), ca làm việc, thông tin khách hàng mẫu (Nguyễn Thị Lan), và voucher vào cơ sở dữ liệu:
```bash
npx prisma db seed
```

---

## 4. Chạy Thử Nghiệm Backend Local

Để khởi chạy API Server ở cổng `5000` (`http://localhost:5000`), chạy lệnh sau trong terminal:
```bash
npm run dev
```

Nếu thành công, bạn sẽ thấy thông báo:
```text
🚀 Server is running on http://localhost:5000
```
Bạn có thể mở trình duyệt truy cập `http://localhost:5000` để nhận thông báo chào mừng từ ứng dụng API.

---

## 5. Kiểm Tra Dữ Liệu Trong pgAdmin 4
Sau khi hoàn tất di chuyển (migration) và nạp mẫu (seed):
1.  Trong pgAdmin 4, nhấn chuột phải vào cơ sở dữ liệu `petto` và chọn **Refresh**.
2.  Mở rộng mục **Schemas** -> **public** -> **Tables**.
3.  Bạn sẽ thấy đầy đủ 16 bảng (ví dụ: `khach_hang`, `thu_cung`, `san_pham`, `dich_vu`, `don_hang`, ...).
4.  Nhấp chuột phải vào bất kỳ bảng nào (ví dụ: `san_pham`) -> Chọn **View/Edit Data** -> **All Rows** để xem dữ liệu mẫu đã được nạp thành công.
