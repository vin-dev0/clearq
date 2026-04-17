import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { Client } from "ssh2";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { host, port, username, password } = await req.json();

  if (!host || !username || !password) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Test SSH connection
  return new Promise<Response>((resolve) => {
    const conn = new Client();
    const timeout = setTimeout(() => {
      conn.end();
      resolve(new Response(JSON.stringify({ success: false, error: "Connection timed out" }), {
        status: 408,
        headers: { "Content-Type": "application/json" },
      }));
    }, 10000);

    conn
      .on("ready", () => {
        clearTimeout(timeout);
        conn.end();
        resolve(
          new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          })
        );
      })
      .on("error", (err: Error) => {
        clearTimeout(timeout);
        resolve(
          new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          )
        );
      })
      .connect({
        host,
        port: port || 22,
        username,
        password,
        readyTimeout: 10000,
      });
  });
}
