import { ServerApi } from "@/app/[locale]/types/nezha-api";
import { GetNezhaData } from "@/lib/serverFetch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const runtime = "edge";

interface NezhaDataResponse {
  error?: string;
  data?: ServerApi;
}

export async function GET(_: Request) {
  const response = (await GetNezhaData()) as NezhaDataResponse;
  if (response.error) {
    console.log(response.error);
    return NextResponse.json({ error: response.error }, { status: 400 });
  }
  return NextResponse.json(response, { status: 200 });
}
