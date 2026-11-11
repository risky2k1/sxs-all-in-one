<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sword x Staff

App Next.js 16 (App Router) quản lý nhiều nhân vật Sword x Staff và sinh prompt. UI tiếng Việt qua `src/locales/vi.json` và `t()`. Trả lời người dùng bằng tiếng Việt.

Dữ liệu nằm trên Supabase remote (`NEXT_PUBLIC_SUPABASE_URL`), không phải database trên máy. `pnpm dev` chỉ chạy web local.

## Bố cục

- `src/app` — route. Studio nhân vật: `src/app/c/[id]/`.
- `src/features/<tên>` — UI một màn. Import feature khác qua `index.ts`, không qua đường dẫn sâu.
- `src/shared` — Supabase, `loadStudio`, UI. Không import `src/features`.
- `supabase/migrations` — schema.
- Ghi dữ liệu bằng Server Action. Control (Owned, phẩm, sao, ô đang lắp) sửa draft trên client ngay trong `useSave`, không chờ Supabase. `router.refresh()` chỉ khi draft không mô tả được kết quả, ví dụ import hoặc thêm skill mới.

## Đổi tab

`loadStudio` chỉ gọi trong `src/app/c/[id]/layout.tsx`. Layout không chạy lại khi đổi tab cùng nhân vật. Mỗi `page.tsx` của tab trả `null`. `StudioShell` giữ `studio` và đổi view trên client ngay khi bấm.

Đừng gọi `loadStudio` trong page của tab. Một lần gọi là xác thực, đọc nhân vật, ghi `last_opened_at`, rồi khoảng 14 query sang Supabase.

## Khi sửa code

- Đọc docs trong `node_modules/next/dist/docs/` trước khi dùng API Next mới.
- Không thêm dependency cho vài dòng.
- Rule và skill của repo: `.cursor/rules`, `.cursor/skills`, `.claude/rules`, `.claude/skills`.
