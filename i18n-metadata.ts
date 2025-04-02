// @auto-i18n-check. Please do not delete the line.
import getEnv from "./lib/env-entry"

export const localeItems = [
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "zh-TW", name: "中文繁體" },
  { code: "zh", name: "中文简体" },
]

export const locales = localeItems.map((item) => item.code)
export const defaultLocale = getEnv("DefaultLocale") || "en"
