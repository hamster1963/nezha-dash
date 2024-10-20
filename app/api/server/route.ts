import { ServerApi } from "@/app/[locale]/types/nezha-api";
import { auth } from "@/auth";
import getEnv from "@/lib/env-entry";
import { GetNezhaData } from "@/lib/serverFetch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const runtime = "edge";

interface NezhaDataResponse {
  error?: string;
  data?: ServerApi;
}

export const GET = auth(async function GET(req) {
  
  if (!req.auth && getEnv("SITE_PASSWORD")) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const response = (await GetNezhaData()) as NezhaDataResponse;
  if (response.error) {
    console.log(response.error);
    return NextResponse.json({ error: response.error }, { status: 400 });
  }
  return NextResponse.json(response, { status: 200 });
});
