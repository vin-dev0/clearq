import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch a single asset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

// PUT: Update an asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Pro access
    const userPlan = (session.user as any).plan;
    const userRole = (session.user as any).role;
    const hasProAccess =
      userPlan === "PRO" ||
      userPlan === "ENTERPRISE" ||
      userRole === "ADMIN" ||
      userRole === "ADMIN";

    if (!hasProAccess) {
      return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      status,
      location,
      department,
      assignedToId,
      assignedToName,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      vendor,
      poNumber,
      specifications,
      notes,
    } = body;

    // Check for duplicate serial number if changed
    if (serialNumber) {
      const existing = await prisma.asset.findFirst({
        where: {
          serialNumber,
          NOT: { id: assetId },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "An asset with this serial number already exists" },
          { status: 400 }
        );
      }
    }

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name,
        type,
        manufacturer,
        model,
        serialNumber,
        status,
        location,
        department,
        assignedToId,
        assignedToName,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        vendor,
        poNumber,
        specifications: specifications ? JSON.stringify(specifications) : undefined,
        notes,
        lastAuditDate: new Date(),
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

// DELETE: Delete an asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Pro access (only admins/admins can delete)
    const userRole = (session.user as any).role;
    if (!["ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await prisma.asset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
