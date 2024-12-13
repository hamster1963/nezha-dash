import { auth } from "@/auth"
import getEnv from "@/lib/env-entry"
import { GetNezhaData } from "@/lib/serverFetch"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

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
    const data = await GetNezhaData()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    const err = error as ResError
    console.error("Error in GET handler:", err)
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
