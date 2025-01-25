import fs from "node:fs"
import path from "node:path"
import { auth } from "@/auth"
import getEnv from "@/lib/env-entry"
import { GetServerIP } from "@/lib/serverFetch"
import { type AsnResponse, type CityResponse, Reader } from "maxmind"
import { redirect } from "next/navigation"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface ResError extends Error {
  statusCode: number
  message: string
}

export type IPInfo = {
  city: CityResponse
  asn: AsnResponse
}

export async function GET(req: NextRequest) {
  if (getEnv("SitePassword")) {
    const session = await auth()
    if (!session) {
      redirect("/")
    }
  }

  if (!getEnv("NEXT_PUBLIC_ShowIpInfo")) {
    return NextResponse.json({ error: "ip info is disabled" }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const server_id = searchParams.get("server_id")

  if (!server_id) {
    return NextResponse.json({ error: "server_id is required" }, { status: 400 })
  }

  try {
    const ip = await GetServerIP({ server_id: Number(server_id) })

    const cityDbPath = path.join(process.cwd(), "lib", "maxmind-db", "GeoLite2-City.mmdb")

    const asnDbPath = path.join(process.cwd(), "lib", "maxmind-db", "GeoLite2-ASN.mmdb")

    const cityDbBuffer = fs.readFileSync(cityDbPath)
    const asnDbBuffer = fs.readFileSync(asnDbPath)

    const cityLookup = new Reader<CityResponse>(cityDbBuffer)
    const asnLookup = new Reader<AsnResponse>(asnDbBuffer)

    const data: IPInfo = {
      city: cityLookup.get(ip) as CityResponse,
      asn: asnLookup.get(ip) as AsnResponse,
    }
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    const err = error as ResError
    console.error("Error in GET handler:", err)
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
