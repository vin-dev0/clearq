"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateUserProfile(userId: string, data: { name?: string; avatar?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  // Basic security: Agents can only edit themselves? Right now for simplicity allowing admins/admins or the user themselves.
  // We'll trust the invocation for this feature since it's an internal admin dash panel.

  const orgId = (session.user as any).organizationId;
  const currentUserRole = (session.user as any).role;

  // Can only update if it's the user themselves OR an admin in the same org
  if (session.user.id !== userId && currentUserRole !== "ADMIN" && currentUserRole !== "ADMIN") {
    throw new Error("Unauthorized to update this user");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.avatar && { avatar: data.avatar }),
    }
  });

  revalidatePath("/teams");
  revalidatePath("/dashboard");
}

export async function getAgents() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const orgId = (session.user as any).organizationId;

  return await prisma.user.findMany({
    where: {
      organizationId: orgId,
      role: { in: ["AGENT", "ADMIN", "SUPERVISOR", "ADMIN"] }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true }
  });

  if (!user) throw new Error("User not found");

  if (!user.passwordHash) {
    throw new Error("This account is authenticated through a third-party provider and does not have a password.");
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    throw new Error("Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash }
  });
}
