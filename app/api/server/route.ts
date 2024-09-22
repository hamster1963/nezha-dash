import { GetNezhaData } from "@/lib/serverFetch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_: Request) {
  try {
    const response = await GetNezhaData();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error }, { status: 400 });
  }
}
