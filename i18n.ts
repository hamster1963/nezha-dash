// @auto-i18n-check. Please do not delete the line.
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

import { locales } from "./i18n-metadata";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
