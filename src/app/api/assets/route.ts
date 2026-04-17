import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate unique asset tag (scoped to organization if available)
async function generateAssetTag(organizationId: string | null): Promise<string> {
  const whereClause = organizationId && organizationId !== "global"
    ? { organizationId }
    : {};

  const lastAsset = await prisma.asset.findFirst({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: { assetTag: true },
  });

  let nextNumber = 1;
  if (lastAsset?.assetTag) {
    const match = lastAsset.assetTag.match(/AST-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `AST-${nextNumber.toString().padStart(5, "0")}`;
}

// GET: Fetch all assets (scoped to user's organization)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Pro access
    const userPlan = (session.user as any).plan;
    const userRole = (session.user as any).role;
    const organizationId = (session.user as any).organizationId;
    const hasProAccess =
      userPlan === "PRO" ||
      userPlan === "ENTERPRISE" ||
      userRole === "ADMIN" ||
      userRole === "ADMIN";

    if (!hasProAccess) {
      return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause with organization filter if available
    const whereClause: any = {};

    // Multi-tenancy: Filter by organization if user has one
    // Admin/Admin without org can see all legacy data (for migration purposes)
    if (organizationId) {
      whereClause.organizationId = organizationId;
    } else if (!["ADMIN"].includes(userRole)) {
      // Regular users without org shouldn't see anything
      return NextResponse.json({ assets: [] });
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      const searchConditions = [
        { name: { contains: search } },
        { assetTag: { contains: search } },
        { serialNumber: { contains: search } },
        { assignedToName: { contains: search } },
      ];

      if (organizationId) {
        whereClause.AND = [
          { organizationId },
          { OR: searchConditions },
        ];
        delete whereClause.organizationId;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    const [assets, inventoryItems] = await Promise.all([
      prisma.asset.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      }),
      prisma.inventory.findMany({
        where: organizationId ? { organizationId } : {},
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // Map inventory items to look like assets for unified UI
    const mappedInventory = inventoryItems.map((item) => ({
      id: item.id,
      assetTag: item.sku,
      name: item.name,
      type: "OTHER", // Map to existing asset types or leave as OTHER
      status: item.quantity > 0 ? "AVAILABLE" : "LOST",
      location: item.category,
      assignedToName: `Qty: ${item.quantity}`,
      createdAt: item.createdAt,
      isInventoryItem: true,
      price: item.price,
      quantity: item.quantity,
    }));

    // Map regular assets to have quantity: 1
    const mappedAssets = assets.map((asset) => ({
      ...asset,
      quantity: 1,
    }));

    const combinedAssets = [...mappedAssets, ...mappedInventory];

    return NextResponse.json({ assets: combinedAssets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

// POST: Create a new asset (scoped to user's organization)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Pro access
    const userPlan = (session.user as any).plan;
    const userRole = (session.user as any).role;
    const organizationId = (session.user as any).organizationId;
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
      assignedToName,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      vendor,
      poNumber,
      specifications,
      notes,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Asset name is required" }, { status: 400 });
    }

    // Check for duplicate serial number if provided
    if (serialNumber) {
      const whereClause: any = { serialNumber };
      if (organizationId) {
        whereClause.organizationId = organizationId;
      }
      const existing = await prisma.asset.findFirst({ where: whereClause });
      if (existing) {
        return NextResponse.json(
          { error: "An asset with this serial number already exists" },
          { status: 400 }
        );
      }
    }

    // Generate unique asset tag (scoped to organization if available)
    const assetTag = await generateAssetTag(organizationId || "global");

    // Create the asset with organization scope (optional for legacy support)
    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name,
        type: type || "LAPTOP",
        manufacturer: manufacturer || null,
        model: model || null,
        serialNumber: serialNumber || null,
        status: status || "AVAILABLE",
        location: location || null,
        department: department || null,
        assignedToName: assignedToName || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice || null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        vendor: vendor || null,
        poNumber: poNumber || null,
        specifications: specifications ? JSON.stringify(specifications) : "{}",
        notes: notes || null,
        barcodeData: assetTag,
        barcodeFormat: "CODE128",
        createdById: session.user.id as string,
        organizationId: organizationId || null, // Multi-tenancy: scope to organization (optional)
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}

