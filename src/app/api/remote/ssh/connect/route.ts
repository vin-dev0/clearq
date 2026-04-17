import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Client } from "ssh2";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export const runtime = "nodejs";
export const maxDuration = 60;

// Store active SSH sessions in memory (keyed by user+host)
if (!(globalThis as any).__sshSessions) {
  (globalThis as any).__sshSessions = {};
}

function getSessions(): Record<string, any> {
  return (globalThis as any).__sshSessions;
}

// Try to load SSH private key
function loadPrivateKey(): Buffer | undefined {
  const sshDir = join(homedir(), ".ssh");
  if (!existsSync(sshDir)) return undefined;
  
  try {
    const { readdirSync } = require("fs");
    const files: string[] = readdirSync(sshDir);
    
    // Prefer standard names first, then any key file
    const prioritized = [
      "id_ed25519", "id_rsa", "id_ecdsa",
      ...files.filter((f: string) => !f.endsWith(".pub") && !["known_hosts", "authorized_keys", "config"].includes(f))
    ];
    
    const seen = new Set<string>();
    for (const f of prioritized) {
      if (seen.has(f)) continue;
      seen.add(f);
      const fullPath = join(sshDir, f);
      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath);
          // Basic check that it looks like a private key
          if (content.toString().includes("PRIVATE KEY") || content.toString().includes("OPENSSH")) {
            console.log(`[SSH] Using private key: ${fullPath}`);
            return content;
          }
        } catch {}
      }
    }
  } catch {}
  return undefined;
}

// POST: Create a new SSH connection
export async function POST(req: NextRequest) {
  console.log("[SSH] Connection request received");
  const session = await auth();
  if (!session?.user) {
    console.log("[SSH] Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { host, port, username, password, cols, rows } = await req.json();
  console.log(`[SSH] Attempting connection to ${username}@${host}:${port || 22}`);

  const sessionKey = `${(session.user as any).id}_${host}`;
  const sessions = getSessions();

  // Clean up existing session if any
  if (sessions[sessionKey]) {
    console.log(`[SSH] Cleaning up old session for ${sessionKey}`);
    try {
      sessions[sessionKey].stream?.end?.();
      sessions[sessionKey].conn?.end?.();
    } catch {}
    delete sessions[sessionKey];
  }

  return new Promise<NextResponse>((resolve) => {
    console.log("[SSH] Initializing SSH client...");
    const conn = new Client();
    const timeout = setTimeout(() => {
      console.log("[SSH] Connection timed out after 15s");
      conn.end();
      resolve(NextResponse.json({ error: "Connection timed out" }, { status: 408 }));
    }, 15000);

    conn
      .on("ready", () => {
        console.log("[SSH] Connection ready, opening shell...");
        clearTimeout(timeout);
        conn.shell(
          { term: "xterm-256color", cols: cols || 100, rows: rows || 30 },
          (err, sshStream) => {
            if (err) {
              console.log(`[SSH] Shell error: ${err.message}`);
              conn.end();
              resolve(NextResponse.json({ error: err.message }, { status: 500 }));
              return;
            }

            console.log("[SSH] Shell stream opened successfully");
            // Buffer output
            const outputBuffer: string[] = [];
            const state = { closed: false };

            sshStream.on("data", (data: Buffer) => {
              outputBuffer.push(Buffer.from(data).toString("base64"));
            });

            sshStream.stderr.on("data", (data: Buffer) => {
              outputBuffer.push(Buffer.from(data).toString("base64"));
            });

            sshStream.on("close", () => {
              state.closed = true;
              try { conn.end(); } catch {}
            });

            // Store session
            sessions[sessionKey] = {
              stream: sshStream,
              conn,
              outputBuffer,
              state,
              lastAccess: Date.now(),
            };

            console.log(`[SSH] Session established: ${sessionKey}`);
            resolve(NextResponse.json({ success: true, sessionKey }));
          }
        );
      })
      .on("error", (err) => {
        clearTimeout(timeout);
        console.log(`[SSH] Connection error for ${host}: ${err.message}`);
        resolve(NextResponse.json({ error: err.message }, { status: 400 }));
      })
      .on("keyboard-interactive", (_name, _instructions, _instructionsLang, prompts, finish) => {
        // Respond to keyboard-interactive auth with the password
        finish([password]);
      })
      .connect({
        host,
        port: port || 22,
        username,
        ...(password ? { password } : {}),
        privateKey: loadPrivateKey(),
        tryKeyboard: true,
        readyTimeout: 15000,
        // Allow all host key algorithms
        algorithms: {
          kex: [
            "curve25519-sha256",
            "curve25519-sha256@libssh.org",
            "ecdh-sha2-nistp256",
            "ecdh-sha2-nistp384",
            "ecdh-sha2-nistp521",
            "diffie-hellman-group-exchange-sha256",
            "diffie-hellman-group14-sha256",
            "diffie-hellman-group14-sha1",
            "diffie-hellman-group1-sha1",
          ],
          serverHostKey: [
            "ssh-ed25519",
            "ecdsa-sha2-nistp256",
            "ecdsa-sha2-nistp384",
            "ecdsa-sha2-nistp521",
            "rsa-sha2-512",
            "rsa-sha2-256",
            "ssh-rsa",
          ],
        },
      });
  });
}
