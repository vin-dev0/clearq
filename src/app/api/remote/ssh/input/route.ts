import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// POST: Send input and/or receive output — optimized for speed
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { host, input } = await req.json();
  const sessionKey = `${(session.user as any).id}_${host}`;

  const sessions = (globalThis as any).__sshSessions || {};
  const sshSession = sessions[sessionKey];

  if (!sshSession || !sshSession.stream) {
    return NextResponse.json({ error: "No active session", closed: true }, { status: 404 });
  }

  // Send input if provided
  if (input) {
    try {
      sshSession.stream.write(input);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // If there's no output yet and we just sent input, wait very briefly for a response (echo)
  if (input && sshSession.outputBuffer.length === 0) {
    await new Promise((r) => setTimeout(r, 5));
  }

  // Drain output buffer — combine all chunks into one base64 string for efficiency
  const chunks = sshSession.outputBuffer.splice(0);
  let combined = "";
  if (chunks.length > 0) {
    // Decode all base64 chunks, concatenate, re-encode once
    const parts: number[] = [];
    for (const b64 of chunks) {
      const decoded = Buffer.from(b64, "base64");
      for (let i = 0; i < decoded.length; i++) parts.push(decoded[i]);
    }
    combined = Buffer.from(parts).toString("base64");
  }

  sshSession.lastAccess = Date.now();

  return NextResponse.json({
    d: combined, // single base64 string — less JSON overhead
    c: sshSession.state?.closed || false,
  });
}
