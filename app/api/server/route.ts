import { ServerApi } from "@/app/[locale]/types/nezha-api";
import { auth } from "@/auth";
import getEnv from "@/lib/env-entry";
import { GetNezhaData } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface NezhaDataResponse {
  error?: string;
  data?: ServerApi;
  cause?: string;
  code?: string;
}

export const GET = auth(async function GET(req) {
  if (!req.auth && getEnv("SitePassword")) {
    redirect("/");
  }

  const response = (await GetNezhaData()) as NezhaDataResponse;
  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 400 });
  }
  if (response.cause) {
    return NextResponse.json(
      { cause: "server connect error" },
      { status: 400 },
    );
  }
  if (response.code === "ConnectionRefused") {
    return NextResponse.json(
      { cause: "server connect error" },
      { status: 400 },
    );
  }
  if (!response.data) {
    return NextResponse.json({ cause: "fetch data empty" }, { status: 400 });
  }
  return NextResponse.json(response, { status: 200 });
});
