"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { send2FAEmail } from "@/lib/mail";

export async function loginWithCredentials(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const otp = formData.get("otp") as string | null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user || !user.passwordHash) {
      return { error: "Invalid email or password" };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { error: "Invalid email or password" };
    }

    let orgSettings: any = {};
    if (user.organization?.settings) {
      try {
        orgSettings = JSON.parse(user.organization.settings);
      } catch (e) {}
    }

    // The security setting enforces 2FA for all users (including clients)
    const requires2FA = orgSettings.mfaRequired;

    if (requires2FA) {
      if (!otp) {
        // Needs OTP, generate and email
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorCode: code,
            twoFactorCodeExpires: expires,
          },
        });

        await send2FAEmail(email, code);

        return { needs2FA: true };
      } else {
        // Verify OTP
        if (
          user.twoFactorCode !== otp ||
          !user.twoFactorCodeExpires ||
          user.twoFactorCodeExpires < new Date()
        ) {
          return { error: "Invalid or expired verification code", needs2FA: true };
        }

        // Clear OTP
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorCode: null,
            twoFactorCodeExpires: null,
          },
        });
      }
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error: any) {
    // NextAuth throws NEXT_REDIRECT on successful login - rethrow it
    if (error?.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    
    if (error instanceof AuthError) {
      console.log("AuthError type:", error.type);
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    
    console.error("Unexpected error:", error);
    return { error: "An unexpected error occurred" };
  }
}


export async function logout() {
  const session = await auth();
  if (session?.user) {
    const organizationId = (session.user as any).organizationId;
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { isDemo: true }
      });
      if (org?.isDemo) {
        console.log(`[DEMO] Wiping demo organization ${organizationId} on logout`);
        try {
          await prisma.organization.delete({ where: { id: organizationId } });
        } catch (e) {
          console.error("[DEMO] Failed to wipe org on logout:", e);
        }
      }
    }
  }
  await signOut({ redirectTo: "/" });
}

