// dummy handlers needed; for deployment on vercel
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "OK" });
}
