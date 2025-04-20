import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: "MongoDB connected successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Connection failed", detail: error },
      { status: 500 }
    );
  }
}
