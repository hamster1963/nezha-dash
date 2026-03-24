import { type NextRequest, NextResponse } from "next/server"
import { createErrorResponse, requireApiSession } from "@/lib/api-route"
import { GetServerDetail } from "@/lib/serverFetchV2"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const unauthorizedResponse = await requireApiSession()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { searchParams } = new URL(req.url)
  const server_id = searchParams.get("server_id")

  if (!server_id) {
    return NextResponse.json({ error: "server_id is required" }, { status: 400 })
  }

  try {
    const serverIdNum = Number.parseInt(server_id, 10)
    if (Number.isNaN(serverIdNum)) {
      return NextResponse.json({ error: "server_id must be a valid number" }, { status: 400 })
    }

    const detailData = await GetServerDetail({ server_id: serverIdNum })
    return NextResponse.json(detailData, { status: 200 })
  } catch (error) {
    console.error("Error in GET handler:", error)
    return createErrorResponse(error)
  }
}
