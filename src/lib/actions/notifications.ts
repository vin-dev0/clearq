"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Return null to indicate session is unavailable, preventing UI clear
      return null;
    }

    const data = await prisma.notification.findMany({
      where: { 
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return data;
  } catch (error) {
    console.error("Error in getNotifications server action:", error);
    return null;
  }
}

export async function markNotificationAsRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });

  revalidatePath("/");
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
}

/**
 * Internal utility to create a notification for a user
 */
export async function createInAppNotification(data: {
  userId: string;
  type: "TICKET_CREATED" | "TICKET_ASSIGNED" | "CHAT_MESSAGE" | "SYSTEM";
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}) {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : "{}",
    },
  });
}
