import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import React from "react";

import NextThemeToaster from "@/components/client/NextToast";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "HomeDash",
  description: "A dashboard for nezha",
  appleWebApp: {
    capable: true,
    title: "HomeDash",
    statusBarStyle: "black-translucent",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextThemeToaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
