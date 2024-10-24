import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export const runtime = "edge";

export default function NotFoundPage() {
  const t = useTranslations("NotFoundPage");
  return (
    <main className="relative h-screen w-full">
      <div className="absolute inset-0 m-4 flex items-center justify-center">
        <Image
          priority
          className="rounded-3xl object-cover"
          src="/tardis.jpg"
          fill={true}
          alt="TARDIS"
        />
        <div className="text-container absolute right-4 p-4 md:right-20">
          <h1 className="text-2xl font-bold opacity-80 md:text-5xl">
            {t("h1_490-590_404NotFound")}
          </h1>
          <p className="text-lg opacity-60 md:text-base">
            {t("p_601-665_TARDISERROR")}
          </p>
          <Link href={"/"} className="text-2xl opacity-80 md:text-3xl">
            {t("Link_676-775_Doctor")}
          </Link>
        </div>
      </div>
    </main>
  );
}
