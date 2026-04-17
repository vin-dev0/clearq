"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCalendarEvents() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const organizationId = (session.user as any).organizationId;
  const events = await prisma.calendarEvent.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      date: "asc",
    },
  });

  return events.map((e: any) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    type: e.type,
    time: e.time,
  }));
}

export async function createCalendarEvent(data: {
  title: string;
  type: string;
  date: Date;
  time: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const organizationId = (session.user as any).organizationId;

  if (!organizationId) {
    throw new Error("No organization found");
  }

  const newEvent = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      type: data.type,
      date: data.date,
      time: data.time,
      createdById: session.user.id,
      organizationId,
    },
  });

  revalidatePath("/calendar");
  
  return {
    id: newEvent.id,
    title: newEvent.title,
    date: newEvent.date,
    type: newEvent.type,
    time: newEvent.time,
  };
}

export async function deleteCalendarEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const organizationId = (session.user as any).organizationId;

  await prisma.calendarEvent.delete({
    where: {
      id,
      organizationId,
    },
  });

  revalidatePath("/calendar");
}
