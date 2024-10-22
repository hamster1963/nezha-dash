// @auto-i18n-check. Please do not delete the line.
import { locales } from "@/i18n-metadata";
import getEnv from "@/lib/env-entry";
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

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const customTitle = getEnv("NEXT_PUBLIC_CustomTitle");
const customDescription = getEnv("NEXT_PUBLIC_CustomDescription");

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: customTitle || "NezhaDash",
  description: customDescription || "A dashboard for nezha",
  appleWebApp: {
    capable: true,
    title: customTitle || "NezhaDash",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css"
        />
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
