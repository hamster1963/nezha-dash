import { useTranslations } from "next-intl"
import Link from "next/link"

import Footer from "./(main)/footer"
import Header from "./(main)/header"

export default function NotFoundPage() {
  const t = useTranslations("NotFoundPage")
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex min-h-[calc(100vh-calc(var(--spacing)*16))] flex-1 flex-col gap-4 bg-background p-4 md:p-10 md:pt-8">
        <Header />
        <section className="flex flex-col items-center min-h-44 justify-center gap-2">
          <p className="text-sm font-semibold">{t("h1_490-590_404NotFound")}</p>
          <Link href="/" className="flex items-center gap-1">
            <p className="text-sm font-medium opacity-40">{t("h1_490-590_404NotFoundBack")}</p>
          </Link>
        </section>
        <Footer />
      </main>
    </div>
  )
}
