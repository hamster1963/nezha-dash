import pack from "@/package.json"
import { useTranslations } from "next-intl"

const GITHUB_URL = "https://github.com/hamster1963/nezha-dash"
const PERSONAL_URL = "https://buycoffee.top"

type LinkProps = {
  href: string
  children: React.ReactNode
}

const FooterLink = ({ href, children }: LinkProps) => (
  <a
    href={href}
    target="_blank"
    className="cursor-pointer font-normal underline decoration-yellow-500 hover:decoration-yellow-600 transition-colors decoration-2 underline-offset-2 dark:decoration-yellow-500/60 dark:hover:decoration-yellow-500/80"
    rel="noreferrer"
  >
    {children}
  </a>
)

const baseTextStyles =
  "text-[13px] font-light tracking-tight text-neutral-600/50 dark:text-neutral-300/50"

export default function Footer() {
  const t = useTranslations("Footer")
  const version = pack.version
  const currentYear = new Date().getFullYear()
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent)

  return (
    <footer className="mx-auto w-full max-w-5xl flex items-center justify-between">
      <section className="flex flex-col">
        <p className={`mt-3 flex gap-1 ${baseTextStyles}`}>
          {t("p_146-598_Findthecodeon")}{" "}
          <FooterLink href={GITHUB_URL}>{t("a_303-585_GitHub")}</FooterLink>
          <FooterLink href={`${GITHUB_URL}/releases/tag/v${version}`}>v{version}</FooterLink>
        </p>
        <section className={`mt-1 flex items-center gap-2 ${baseTextStyles}`}>
          {t("section_607-869_2020")}
          {currentYear} <FooterLink href={PERSONAL_URL}>{t("a_800-850_Hamster1963")}</FooterLink>
        </section>
      </section>
      <p className={`mt-1 ${baseTextStyles}`}>
        <kbd className="pointer-events-none mx-1 inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          {isMac ? <span className="text-xs">⌘</span> : "Ctrl "}K
        </kbd>
      </p>
    </footer>
  )
}
