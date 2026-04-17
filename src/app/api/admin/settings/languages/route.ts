import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = (session?.user as any)?.organizationId;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let effectiveOrgId = organizationId;

    if (!effectiveOrgId) {
      // Check if user is a global ADMIN
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { role: true }
      });

      if (user?.role === "ADMIN") {
        const firstOrg = await prisma.organization.findFirst({
          orderBy: { createdAt: "asc" }
        });
        if (firstOrg) {
          effectiveOrgId = firstOrg.id;
        }
      }
    }

    if (!effectiveOrgId) {
      return NextResponse.json({ error: "No organization assigned" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: effectiveOrgId },
      select: { settings: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let settings: any = {};
    try {
      settings = JSON.parse(org.settings || "{}");
    } catch (e) {
      console.error("Malformed settings JSON:", org.settings);
    }
    
    const langSettings = settings.languages || {
      default: "en",
      enabled: ["en"],
      autoDetect: true,
      autoTranslate: true
    };

    return NextResponse.json(langSettings);
  } catch (error) {
    console.error("Error fetching language settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    // Performance: Refresh user record to ensure latest role permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, organizationId: true }
    });

    const role = currentUser?.role;
    const organizationId = currentUser?.organizationId;

    if (!role || !["ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized", details: "Insufficient permissions" }, { status: 403 });
    }

    let effectiveOrgId = organizationId;

    if (!effectiveOrgId) {
      if (role === "ADMIN") {
        // Fallback to the first organization for Global Admins
        const firstOrg = await prisma.organization.findFirst({
          orderBy: { createdAt: "asc" }
        });
        if (firstOrg) {
          effectiveOrgId = firstOrg.id;
        }
      }
    }

    if (!effectiveOrgId) {
      return NextResponse.json({ error: "No organization assigned" }, { status: 400 });
    }

    const body = await request.json();
    const { default: defaultLang, enabled, autoDetect, autoTranslate } = body;

    const org = await prisma.organization.findUnique({
      where: { id: effectiveOrgId },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let settings: any = {};
    try {
      settings = JSON.parse(org.settings || "{}");
    } catch (e) {
      console.error("Malformed settings JSON during PATCH:", org.settings);
    }
    
    settings.languages = {
      default: defaultLang || settings.languages?.default || "en",
      enabled: enabled || settings.languages?.enabled || ["en"],
      autoDetect: autoDetect !== undefined ? autoDetect : settings.languages?.autoDetect ?? true,
      autoTranslate: autoTranslate !== undefined ? autoTranslate : settings.languages?.autoTranslate ?? true,
    };

    await prisma.organization.update({
      where: { id: effectiveOrgId },
      data: {
        settings: JSON.stringify(settings),
      },
    });

    return NextResponse.json({ success: true, languages: settings.languages });
    } catch (error: any) {
      console.error("Error updating language settings:", error);
      return NextResponse.json({ 
        error: "Failed to update settings",
        details: error.message 
      }, { status: 500 });
    }
}
