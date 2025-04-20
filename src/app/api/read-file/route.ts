import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    // Security check: ensure the path is within the project directory
    const absolutePath = path.join(process.cwd(), filePath);
    if (!absolutePath.startsWith(process.cwd())) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const content = await fs.readFile(absolutePath, "utf-8");
    return new NextResponse(content);
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
