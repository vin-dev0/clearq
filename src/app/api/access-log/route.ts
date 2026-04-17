import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// Parse user agent to extract browser, OS, and device info
function parseUserAgent(ua: string | null): { browser: string; os: string; device: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Unknown" };

  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Browser detection
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  // OS detection
  if (ua.includes("Windows NT 10")) os = "Windows 10";
  else if (ua.includes("Windows NT 11") || (ua.includes("Windows NT 10") && ua.includes("Win64"))) os = "Windows 11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Device detection
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) device = "Mobile";
  else if (ua.includes("Tablet") || ua.includes("iPad")) device = "Tablet";

  return { browser, os, device };
}

// Log user access - called from middleware or pages
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const headersList = await headers();
    const body = await request.json();

    // Get IP address - check various headers
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const cfConnectingIp = headersList.get("cf-connecting-ip");
    
    let ipAddress = cfConnectingIp || realIp || forwardedFor?.split(",")[0]?.trim() || "Unknown";
    
    // Get user agent
    const userAgent = headersList.get("user-agent");
    const { browser, os, device } = parseUserAgent(userAgent);

    // Get geo data from Cloudflare or Vercel headers if available
    const country = headersList.get("cf-ipcountry") || headersList.get("x-vercel-ip-country") || null;
    const city = headersList.get("cf-ipcity") || headersList.get("x-vercel-ip-city") || null;
    const region = headersList.get("cf-region") || headersList.get("x-vercel-ip-country-region") || null;

    // Create access log
    const accessLog = await prisma.accessLog.create({
      data: {
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || body.email || null,
        ipAddress,
        country,
        city,
        region,
        userAgent,
        browser,
        os,
        device,
        path: body.path || "/",
        method: body.method || "GET",
        statusCode: body.statusCode || 200,
        action: body.action || "PAGE_VIEW",
        metadata: JSON.stringify(body.metadata || {}),
      },
    });

    return NextResponse.json({ success: true, id: accessLog.id });
  } catch (error) {
    console.error("Error logging access:", error);
    return NextResponse.json({ error: "Failed to log access" }, { status: 500 });
  }
}

