"use client";

import { useLocale } from "next-intl";
import { localeItems } from "../i18n-metadata";
import { useRouter, usePathname } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (code: string) => {
    const newLocale = code;

    const rootPath = "/";
    const currentLocalePath = `/${locale}`;
    const newLocalePath = `/${newLocale}`;

    // Function to construct new path with locale prefix
    const constructLocalePath = (path: string, newLocale: string) => {
      if (path.startsWith(currentLocalePath)) {
        return path.replace(currentLocalePath, `/${newLocale}`);
      } else {
        return `/${newLocale}${path}`;
      }
    };

    if (pathname === rootPath || !pathname) {
      router.push(newLocalePath);
    } else if (
      pathname === currentLocalePath ||
      pathname === `${currentLocalePath}/`
    ) {
      router.replace(newLocalePath);
    } else {
      const newPath = constructLocalePath(pathname, newLocale);
      router.replace(newPath);
    }
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full px-[9px]">
          {localeItems.find((item) => item.code === locale)?.name}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {localeItems.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => handleChange(item.code)}
          >
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
