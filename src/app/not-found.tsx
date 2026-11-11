import Link from "next/link";

import { PATHS } from "@/shared/config/paths";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center gap-3 p-6">
      <h1 className="font-heading text-2xl">Không thấy trang</h1>
      <Link
        href={PATHS.home}
        className="border-2 border-border bg-main px-3 py-2 font-heading"
      >
        Về studio
      </Link>
    </main>
  );
}
