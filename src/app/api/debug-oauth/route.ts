import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Check Account table
    const accountCount = await prisma.account.count();
    const accounts = await prisma.account.findMany({
      take: 5,
      select: {
        id: true,
        provider: true,
        userId: true,
        type: true,
      },
    });
    
    // Check User table for OAuth users (users without passwordHash)
    const oauthUsers = await prisma.user.findMany({
      where: { passwordHash: null },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    // Check for any users
    const totalUsers = await prisma.user.count();
    
    return NextResponse.json({
      status: "success",
      database: "connected",
      stats: {
        totalUsers,
        totalAccounts: accountCount,
      },
      oauthUsers,
      recentAccounts: accounts,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Debug OAuth Error:", err);
    return NextResponse.json(
      {
        status: "error",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

