-- Chạy trong Supabase SQL Editor (hoặc psql có quyền) SAU KHI đã apply migration.
-- Gán admin cho user của bạn, rồi tạo dữ liệu mẫu (hoặc dùng UI admin trên /dashboard).

-- Thay YOUR_USER_UUID bằng id từ auth.users / bảng profiles.
-- update public.profiles set role = 'admin' where id = 'YOUR_USER_UUID';

-- Dữ liệu mẫu lớp (bỏ qua nếu bạn đã tạo lớp qua UI admin).
-- insert into public.classes (name, hourly_rate) values
--   ('Lớp A', 150000),
--   ('Lớp B', 200000);
