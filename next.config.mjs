import withPWAInit from "@ducanh2912/next-pwa"
import withBundleAnalyzer from "@next/bundle-analyzer"
import createNextIntlPlugin from "next-intl/plugin"

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const withNextIntl = createNextIntlPlugin()

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true,
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  reactCompiler: true,
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
export default bundleAnalyzer(withPWA(withNextIntl(nextConfig)))
