"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventoryItems() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const orgId = (session.user as any).organizationId;
    if (!orgId) {
      console.warn("No organizationId found in session");
      return [];
    }

    const inventoryItems = await prisma.inventory.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: "desc" },
    });

    return inventoryItems;
  } catch (err: any) {
    console.error("Error in getInventoryItems:", err);
    throw new Error(err.message || "Failed to fetch inventory items");
  }
}

export async function createInventoryItem(data: {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const orgId = (session.user as any).organizationId;
  console.log("Creating inventory item for org:", orgId, "data:", data);
  if (!orgId) throw new Error("No organization assigned to user");

  try {
    const item = await (prisma as any).inventory.create({
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        minStock: data.minStock,
        price: data.price,
        organizationId: orgId,
      },
    });
    return item;
  } catch (err: any) {
    console.error("Error in createInventoryItem:", err);
    throw new Error(err.message || "Failed to create inventory item");
  }
}

export async function updateInventoryItem(id: string, data: Partial<{
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
}>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const orgId = (session.user as any).organizationId;

  const item = await prisma.inventory.update({
    where: { id, organizationId: orgId },
    data,
  });

  revalidatePath("/inventory");
  return item;
}

export async function deleteInventoryItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const orgId = (session.user as any).organizationId;

  await prisma.inventory.delete({
    where: { id, organizationId: orgId },
  });

  revalidatePath("/inventory");
}
