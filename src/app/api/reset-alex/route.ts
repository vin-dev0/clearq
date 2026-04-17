import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("password456", 10);
    
    let org = await prisma.organization.findFirst();
    if (!org) {
      // Create a default org if none exists
      org = await prisma.organization.create({
        data: {
          name: "Default Organization",
          slug: "default",
          domain: "default.com",
          plan: "PRO",
          subscriptionStatus: "ACTIVE",
        }
      });
    }

    const user = await prisma.user.upsert({
      where: { email: "alex@company.com" },
      update: {
        passwordHash: passwordHash,
        organizationId: org.id,
        isActive: true,
        role: "ADMIN"
      },
      create: {
        email: "alex@company.com",
        name: "Alex Johnson",
        passwordHash: passwordHash,
        role: "ADMIN",
        organizationId: org.id,
        isActive: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Alex restored with password 'password456'",
      user: { email: user.email, name: user.name }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
