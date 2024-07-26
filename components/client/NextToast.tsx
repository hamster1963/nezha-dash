"use client";
import { useTheme } from "next-themes";
import React from "react";
import { Toaster } from "sonner";

type ThemeType = "light" | "dark" | "system"; // 声明 theme 的类型
export default function NextThemeToaster() {
  const { theme } = useTheme();
  const themeMap: Record<ThemeType, string> = {
    light: "light",
    dark: "dark",
    system: "system",
  };

  // 使用类型断言确保theme是一个ThemeType
  const selectedTheme = theme ? themeMap[theme as ThemeType] : "system";

  return (
    <Toaster
      theme={selectedTheme as ThemeType}
      richColors={true}
      duration={2000}
      position="top-center"
      className={"mb-16 sm:mb-14"}
    />
  );
}
