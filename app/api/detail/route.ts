import { NezhaAPISafe } from "@/app/[locale]/types/nezha-api";
import { auth } from "@/auth";
import getEnv from "@/lib/env-entry";
import { GetServerDetail } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface NezhaDataResponse extends NezhaAPISafe {
  error?: string;
  cause?: string;
  code?: string;
}

export const GET = auth(async function GET(req) {
  if (!req.auth && getEnv("SitePassword")) {
    redirect("/");
  }

  const { searchParams } = new URL(req.url);
  const server_id = searchParams.get("server_id");
  if (!server_id) {
    return NextResponse.json(
      { error: "server_id is required" },
      { status: 400 },
    );
  }
  const response = (await GetServerDetail({
    server_id: parseInt(server_id),
  })) as NezhaDataResponse;
  if (response.error) {
    console.log(response.error);
    return NextResponse.json({ error: response.error }, { status: 400 });
  }
  if (response.cause) {
    console.log("GetServerDetail error(cause):", response);
    return NextResponse.json(
      { cause: "server connect error" },
      { status: 400 },
    );
  }
  if (response.code === "ConnectionRefused") {
    console.log("GetServerDetail error(code):", response);
    return NextResponse.json(
      { cause: "server connect error" },
      { status: 400 },
    );
  }
  return NextResponse.json(response, { status: 200 });
});
