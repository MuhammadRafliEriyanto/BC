import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bimbel LMS Dashboard",
    template: "%s | Bimbel LMS",
  },
  description:
    "Dashboard modern untuk Owner, Admin, Guru, dan Siswa pada LMS Bimbingan Belajar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
