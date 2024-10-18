"use client";

import { BackIcon } from "@/components/Icon";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {

  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:gap-6">
      <div
        onClick={() => {
          router.push(`/${locale}/`);
        }}
        className="flex flex-none cursor-pointer font-medium items-center break-all tracking-tight gap-0.5 text-2xl"
      >
        <BackIcon />
        HomeDash
      </div>
    </div>
  );
}
