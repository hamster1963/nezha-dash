
import React from "react";
import Header from "@/app/[locale]/(main)/header";
import Footer from "./footer";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Viewport } from "next";
import { cn } from "@/lib/utils";
import { PublicEnvScript } from "next-runtime-env";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "NezhaDash",
  description: "A dashboard for nezha",
  appleWebApp: {
    capable: true,
    title: "NezhaDash",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

type DashboardProps = {
  children: React.ReactNode;
};
export default function MainLayout({ children }: DashboardProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:p-10 md:pt-8">
        <Header />
        {children}
        <Footer />
      </main>
    </div>
  );
}
