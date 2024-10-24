"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeItems } from "@/i18n-metadata";
import { setUserLocale } from "@/i18n/locale";
import { useLocale } from "next-intl";
import * as React from "react";

export function LanguageSwitcher() {
  const locale = useLocale();

  function onChange(value: string) {
    const locale = value;
    setUserLocale(locale);
  }

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
          <DropdownMenuItem key={item.code} onClick={() => onChange(item.code)}>
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
