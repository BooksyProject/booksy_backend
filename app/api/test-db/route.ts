// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose"; // đường dẫn tuỳ theo cấu trúc dự án của bạn

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
