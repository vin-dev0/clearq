import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Find the test user
    const user = await prisma.user.findUnique({
      where: { email: "alex@company.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        status: "error",
        message: "User not found",
        userCount,
        databaseConnected: true,
      });
    }

    // Test password comparison
    const passwordMatch = await bcrypt.compare("password123", user.passwordHash || "");

    return NextResponse.json({
      status: "success",
      databaseConnected: true,
      userCount,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPasswordHash: !!user.passwordHash,
        hashPrefix: user.passwordHash?.substring(0, 10),
      },
      passwordMatch,
      bcryptVersion: "bcryptjs",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
      databaseConnected: false,
    });
  }
}

