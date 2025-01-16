import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TopBar from "@/components/ui/topBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Time Keeper",
  description: "Manage your time with effectively with My Time Keeper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
