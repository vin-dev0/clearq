import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Disconnect an active SSH session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { host } = await req.json();
  const sessionKey = `${session.user.id}_${host}`;

  const sessions = (globalThis as any).__sshSessions || {};
  const sshSession = sessions[sessionKey];

  if (sshSession) {
    try {
      sshSession.stream?.end?.();
      sshSession.conn?.end?.();
    } catch {}
    delete sessions[sessionKey];
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
