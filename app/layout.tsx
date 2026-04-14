import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WhopIframeSdkProvider } from "@whop/react";
// @ts-ignore — CSS module side-effect import
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cohort Dashboard",
  description: "Churn analytics for Whop sellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0a0a] text-[#f5f5f5] antialiased">
        <WhopIframeSdkProvider>{children}</WhopIframeSdkProvider>
      </body>
    </html>
  );
}
