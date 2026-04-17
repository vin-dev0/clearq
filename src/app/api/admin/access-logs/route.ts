import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin or admin
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { userEmail: { contains: search } },
        { ipAddress: { contains: search } },
        { path: { contains: search } },
        { country: { contains: search } },
        { city: { contains: search } },
      ];
    }

    if (action) {
      where.action = action;
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.accessLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.accessLog.count({ where }),
    ]);

    // Get unique actions for filter dropdown
    const actions = await prisma.accessLog.findMany({
      select: { action: true },
      distinct: ["action"],
    });

    // Get stats
    const stats = await prisma.accessLog.groupBy({
      by: ["action"],
      _count: { action: true },
    });

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      actions: actions.map((a) => a.action),
      stats,
    });
  } catch (error) {
    console.error("Error fetching access logs:", error);
    return NextResponse.json({ error: "Failed to fetch access logs" }, { status: 500 });
  }
}

// Delete old logs (cleanup endpoint)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    // Only admins can delete logs
    const userRole = (session?.user as any)?.role;
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.accessLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Deleted ${result.count} logs older than ${days} days`,
    });
  } catch (error) {
    console.error("Error deleting access logs:", error);
    return NextResponse.json({ error: "Failed to delete access logs" }, { status: 500 });
  }
}

