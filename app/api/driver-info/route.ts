import { NextResponse } from "next/server"
import { createErrorResponse, requireApiSession } from "@/lib/api-route"
import { GetDriverInfo } from "@/lib/serverFetchV2"

export const dynamic = "force-dynamic"

export async function GET() {
  const unauthorizedResponse = await requireApiSession()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const driverInfo = await GetDriverInfo()
    return NextResponse.json(driverInfo, { status: 200 })
  } catch (error) {
    console.error("Error in GET handler:", error)
    return createErrorResponse(error)
  }
}
