import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const originalName = file.name;
    const extension = originalName.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${extension}`;
    
    // Path to save file
    const path = join(process.cwd(), "public", "uploads", uniqueFilename);
    const url = `/uploads/${uniqueFilename}`;

    await writeFile(path, buffer);

    return NextResponse.json({
      filename: originalName,
      url: url,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
