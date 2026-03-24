import fs from "node:fs"
import path from "node:path"
import { type AsnResponse, type CityResponse, Reader } from "maxmind"
import { type NextRequest, NextResponse } from "next/server"
import { createErrorResponse, requireApiSession } from "@/lib/api-route"
import getEnv from "@/lib/env-entry"
import { GetServerIP } from "@/lib/serverFetchV2"

export const dynamic = "force-dynamic"

export type IPInfo = {
  city: CityResponse
  asn: AsnResponse
}

const cityLookup = new Reader<CityResponse>(
  fs.readFileSync(path.join(process.cwd(), "lib", "maxmind-db", "GeoLite2-City.mmdb")),
)
const asnLookup = new Reader<AsnResponse>(
  fs.readFileSync(path.join(process.cwd(), "lib", "maxmind-db", "GeoLite2-ASN.mmdb")),
)

export async function GET(req: NextRequest) {
  const unauthorizedResponse = await requireApiSession()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  if (getEnv("NEXT_PUBLIC_ShowIpInfo") !== "true") {
    return NextResponse.json({ error: "ip info is disabled" }, { status: 400 })
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

    const ip = await GetServerIP({ server_id: serverIdNum })

    const data: IPInfo = {
      city: cityLookup.get(ip) as CityResponse,
      asn: asnLookup.get(ip) as AsnResponse,
    }
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error in GET handler:", error)
    return createErrorResponse(error)
  }
}
