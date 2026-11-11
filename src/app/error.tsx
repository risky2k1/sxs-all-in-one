"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center gap-3 p-6">
      <h1 className="font-heading text-2xl">Có lỗi khi tải trang</h1>
      {error.digest ? <p className="text-sm">{error.digest}</p> : null}
      <button
        type="button"
        className="border-2 border-border bg-main px-3 py-2 font-heading"
        onClick={reset}
      >
        Thử lại
      </button>
    </main>
  );
}
