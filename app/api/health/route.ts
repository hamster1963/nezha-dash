import { NextResponse } from "next/server"
import { createErrorResponse, requireApiSession } from "@/lib/api-route"
import getEnv from "@/lib/env-entry"
import { PerformHealthCheck } from "@/lib/serverFetchV2"

export const dynamic = "force-dynamic"

export async function GET() {
  const unauthorizedResponse = await requireApiSession()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const isHealthy = await PerformHealthCheck()

    // Even if health check fails, we return useful information
    const responseData = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      status: isHealthy ? "ok" : "error",
      environment: {
        komariMode: getEnv("NEXT_PUBLIC_Komari") === "true",
        hasKomariUrl: !!getEnv("KomariBaseUrl"),
        myNodeQueryMode: getEnv("NEXT_PUBLIC_MyNodeQuery") === "true",
        hasMyNodeQueryUrl: !!getEnv("MyNodeQueryBaseUrl"),
        hasNezhaUrl: !!getEnv("NezhaBaseUrl"),
        hasNezhaAuth: !!getEnv("NezhaAuth"),
      },
    }

    return NextResponse.json(responseData, {
      status: isHealthy ? 200 : 503,
    })
  } catch (error) {
    console.error("Error in health check:", error)
    const responseData = {
      healthy: false,
      error: error instanceof Error ? error.message : "Health check failed",
      timestamp: new Date().toISOString(),
      status: "error",
      environment: {
        komariMode: getEnv("NEXT_PUBLIC_Komari") === "true",
        hasKomariUrl: !!getEnv("KomariBaseUrl"),
        myNodeQueryMode: getEnv("NEXT_PUBLIC_MyNodeQuery") === "true",
        hasMyNodeQueryUrl: !!getEnv("MyNodeQueryBaseUrl"),
        hasNezhaUrl: !!getEnv("NezhaBaseUrl"),
        hasNezhaAuth: !!getEnv("NezhaAuth"),
      },
    }

    const errorResponse = createErrorResponse(error, "Health check failed")
    return NextResponse.json(responseData, {
      status: errorResponse.status,
    })
  }
}
