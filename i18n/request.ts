import { getUserLocale } from "@/i18n/locale"
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async () => {
  const locale = await getUserLocale()

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
