import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import getEnv from "@/lib/env-entry"
import { GetDriverInfo } from "@/lib/serverFetchV2"

export const dynamic = "force-dynamic"

interface ResError extends Error {
  statusCode: number
  message: string
}

export async function GET() {
  if (getEnv("SitePassword")) {
    const session = await auth()
    if (!session) {
      redirect("/")
    }
  }

  try {
    const driverInfo = await GetDriverInfo()
    return NextResponse.json(driverInfo, { status: 200 })
  } catch (error) {
    const err = error as ResError
    console.error("Error in GET handler:", err)

    // Even if driver info fails, return configuration information
    const fallbackInfo = {
      error: err.message || "Driver initialization failed",
      environment: {
        komariMode: getEnv("NEXT_PUBLIC_Komari") === "true",
        hasKomariUrl: !!getEnv("KomariBaseUrl"),
        hasNezhaUrl: !!getEnv("NezhaBaseUrl"),
        hasNezhaAuth: !!getEnv("NezhaAuth"),
      },
      availableDrivers: ["nezha", "komari"],
      configuredDriver: getEnv("NEXT_PUBLIC_Komari") === "true" ? "komari" : "nezha",
    }

    const statusCode = err.statusCode || 500
    return NextResponse.json(fallbackInfo, { status: statusCode })
  }
}
