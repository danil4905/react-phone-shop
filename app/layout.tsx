import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/header/Header";
import { PUBLIC_LINKS } from "@/config/navigation";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Mobile Shop",
  description: "Next mobile shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.variable}>
        <AuthBootstrap />
        <Header links={PUBLIC_LINKS} />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
