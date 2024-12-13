import { auth } from "@/auth"
import getEnv from "@/lib/env-entry"
import { GetServerDetail } from "@/lib/serverFetch"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface ResError extends Error {
  statusCode: number
  message: string
}

export async function GET(req: NextRequest) {
  if (getEnv("SitePassword")) {
    const session = await auth()
    if (!session) {
      redirect("/")
    }
  }

  const { searchParams } = new URL(req.url)
  const server_id = searchParams.get("server_id")

  if (!server_id) {
    return NextResponse.json({ error: "server_id is required" }, { status: 400 })
  }

  try {
    const serverIdNum = parseInt(server_id, 10)
    if (isNaN(serverIdNum)) {
      return NextResponse.json({ error: "server_id must be a valid number" }, { status: 400 })
    }

    const detailData = await GetServerDetail({ server_id: serverIdNum })
    return NextResponse.json(detailData, { status: 200 })
  } catch (error) {
    const err = error as ResError
    console.error("Error in GET handler:", err)
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
