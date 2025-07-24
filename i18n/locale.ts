"use server"

import { cookies } from "next/headers"
import getEnv from "@/lib/env-entry"

const COOKIE_NAME = "NEXT_LOCALE"

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value || (getEnv("DefaultLocale") ?? "en")
}

export async function setUserLocale(locale: string) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
