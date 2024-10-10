// @auto-i18n-check. Please do not delete the line.
import { locales } from "@/i18n-metadata";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Viewport } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";
import { PublicEnvScript } from "next-runtime-env";
import { ThemeProvider } from "next-themes";
import { Inter as FontSans } from "next/font/google";
import React from "react";

import "/node_modules/flag-icons/css/flag-icons.min.css";

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

// optimization: force static for vercel
export const dynamic = process.env.VERCEL ? "force-static" : "auto";

export const runtime = 'edge';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  const messages = useMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <PublicEnvScript />
      </head>
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
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
