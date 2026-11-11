---
name: studio-tabs
description: Use when editing Sword x Staff character studio tabs, loadStudio, StudioShell, or navigation between overview, skills, equipment, resources, companions, and prompt.
---

# Tab studio

`loadStudio` chạy trong `src/app/c/[id]/layout.tsx` một lần cho mỗi lần vào nhân vật. Control sửa draft trong `useSave` ngay lúc bấm. `router.refresh()` chỉ khi kết quả không mô tả được bằng draft, ví dụ import hoặc skill mới.

Page của từng tab trả `null`. `StudioShell` giữ object `studio` và render view theo path. Bấm tab đổi view trên client, không chờ Supabase.

Khi thêm tab mới: thêm segment vào `STUDIO_TABS` và `PATHS`, thêm page rỗng dưới `src/app/c/[id]/`, thêm view vào map `VIEWS` trong `StudioShell`. Đừng fetch lại studio trong page.
