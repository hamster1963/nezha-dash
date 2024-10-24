import { auth } from "@/auth";
import getEnv from "@/lib/env-entry";
import { GetServerMonitor } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const dynamic = "force-dynamic";

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

  try {
    const serverIdNum = parseInt(server_id, 10);
    if (isNaN(serverIdNum)) {
      return NextResponse.json(
        { error: "server_id must be a number" },
        { status: 400 },
      );
    }

    const monitorData = await GetServerMonitor({
      server_id: serverIdNum,
    });
    return NextResponse.json(monitorData, { status: 200 });
  } catch (error) {
    console.error("Error in GET handler:", error);
    // @ts-ignore
    const statusCode = error.statusCode || 500;
    // @ts-ignore
    const message = error.message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
});
