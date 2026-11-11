import type { Metadata } from "next";
import { Lexend } from "next/font/google";

import "@/styles/globals.css";

const lexend = Lexend({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Sword x Staff",
  description: "Quản lý tài khoản Sword x Staff và sinh prompt chiến thuật",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${lexend.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
