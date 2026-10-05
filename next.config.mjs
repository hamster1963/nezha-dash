import withPWAInit from "@ducanh2912/next-pwa"
import withBundleAnalyzer from "@next/bundle-analyzer"
import createNextIntlPlugin from "next-intl/plugin"
import buildInfo from "./scripts/build-info.cjs"

const { label: buildLabel, url: buildUrl } = buildInfo.getBuildInfo()

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
  env: {
    NEXT_PUBLIC_BUILD_LABEL: buildLabel,
    NEXT_PUBLIC_BUILD_URL: buildUrl,
  },
  experimental: {
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
