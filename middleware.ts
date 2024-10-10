// @auto-i18n-check. Please do not delete the line.
import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./i18n-metadata";

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,

  // 'always': This is the default, The home page will also be redirected to the default language, such as www.abc.com to www.abc.com/en
  // 'as-needed': The default page is not redirected. For example, if you open www.abc.com, it is still www.abc.com
  localePrefix: "always",
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(en|zh|zh-t|ja)/:path*"],
};
