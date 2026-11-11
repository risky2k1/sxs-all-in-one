# Sword x Staff

App Next.js quản lý tài khoản Sword x Staff (nhiều nhân vật) và sinh prompt. Dữ liệu nằm trên Supabase. Ảnh mặc định nằm trong `public/assets`; ảnh bạn tải lên ghi đè qua Storage.

## Chạy local

```bash
pnpm install
pnpm setup:db
pnpm dev
```

`.env.local` cần `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Lần đầu mở `/login`, tạo tài khoản chủ (email + mật khẩu, tối thiểu 8 ký tự). App chỉ cho tạo khi chưa có chủ. Nên tắt đăng ký công khai trong Supabase Auth sau bước đó.

Nhân vật đầu tiên là mẫu Aquariuss. Trang Nhân vật tạo nhân vật trống hoặc nhân bản. Trang Ảnh (chỉ chủ) đổi icon; nút dùng ảnh mặc định xóa bản đã tải.

Node 24.22.1 trở lên. Bản đang khóa: Next.js 16.4.6, React 19.3.1.
