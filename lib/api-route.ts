import { NextResponse } from "next/server"
import { auth } from "@/auth"
import getEnv from "@/lib/env-entry"

type RouteError = {
  message?: string
  statusCode?: number
}

export async function requireApiSession() {
  if (!getEnv("SitePassword")) {
    return null
  }

  const session = await auth()
  if (session) {
    return null
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function createErrorResponse(error: unknown, fallbackMessage = "Internal Server Error") {
  const routeError = error as RouteError
  const message =
    typeof routeError?.message === "string" && routeError.message.length > 0
      ? routeError.message
      : fallbackMessage
  const statusCode =
    typeof routeError?.statusCode === "number" ? routeError.statusCode : 500

  return NextResponse.json({ error: message }, { status: statusCode })
}
