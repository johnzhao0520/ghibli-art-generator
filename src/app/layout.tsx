import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghibli-Inspired AI Image Generator (MVP)",
  description: "Upload → Generate → Download (Ghibli-inspired)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full font-sans bg-gradient-to-b from-emerald-50 to-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
