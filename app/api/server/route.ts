import { auth } from "@/auth";
import getEnv from "@/lib/env-entry";
import { GetNezhaData } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = auth(async function GET(req) {
  if (!req.auth && getEnv("SitePassword")) {
    redirect("/");
  }

  try {
    const data = await GetNezhaData();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET handler:", error);
    // @ts-ignore
    const statusCode = error.statusCode || 500;
    // @ts-ignore
    const message = error.message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
});
