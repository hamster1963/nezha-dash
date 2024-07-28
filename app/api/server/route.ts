import { GetNezhaData } from "@/lib/serverFetch";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
  try {
    const response = await GetNezhaData();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 200 });
  }
}
