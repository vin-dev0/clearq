import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account }) {
      console.log("SignIn event:", { userId: user?.id, provider: account?.provider });
    },
    async createUser({ user }) {
      console.log("CreateUser event:", { userId: user?.id, email: user?.email });
    },
    async linkAccount({ user, account }) {
      console.log("LinkAccount event:", { userId: user?.id, provider: account?.provider });
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      const email = user?.email?.toLowerCase() || "";
      if (!email) return true;

      const domain = email.split('@')[1];
      const isCommonDomain = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com"].includes(domain);

      // Handle domain-based organization assignment
      if (!isCommonDomain) {
        let org = await prisma.organization.findFirst({
          where: { domain }
        });

        if (!org) {
          const companyName = domain.split('.')[0];
          let slug = companyName;
          while (await prisma.organization.findUnique({ where: { slug } })) {
             slug = `${companyName}-${Math.floor(Math.random() * 1000)}`;
          }

          org = await prisma.organization.create({
            data: {
              name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
              slug,
              domain,
              plan: "STARTER",
              subscriptionStatus: "EXPIRED",
            }
          });

          await prisma.team.create({
            data: {
              name: "General",
              description: "Default team for all members",
              organizationId: org.id
            }
          });
        }

        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (!existingUser && account?.provider !== "credentials") {
           await prisma.user.create({
             data: {
               email,
               name: user?.name || email.split('@')[0],
               image: user?.image || undefined,
               role: "CLIENT",
               organizationId: org.id,
             }
           });
           // Explicitly NOT adding to team since they are CLIENT role
        }
      } else {
        // For common domains, block new OAuth signups if user doesn't exist
        const isOAuth = ["google", "github", "azure-ad"].includes(account?.provider || "");
        if (isOAuth) {
          const existingUser = await prisma.user.findFirst({ where: { email } });
          if (!existingUser) {
            console.log("Blocking new OAuth signup for common domain:", email);
            return `/login?error=oauth_no_account`;
          }
        }
      }

      // Link OAuth account and update last login if OAuth
      const isOAuth = ["google", "github", "azure-ad"].includes(account?.provider || "");
      if (isOAuth) {
        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (existingUser) {
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: account!.provider,
            },
          });

          if (!existingAccount && account) {
            try {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token as string | null,
                  expires_at: account.expires_at as number | null,
                  token_type: account.token_type as string | null,
                  scope: account.scope as string | null,
                  id_token: account.id_token as string | null,
                  refresh_token: account.refresh_token as string | null,
                },
              });
            } catch (e) {
              console.log("Account may already exist, continuing:", e);
            }
          }

          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLoginAt: new Date() },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.user?.image || session.user?.avatar) {
          token.avatar = (session.user.image || session.user.avatar) as string;
          token.picture = token.avatar as string;
        }
      }

      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.organizationId = (user as any).organizationId;
      }

      if (token.id) {
        console.log(`[AUTH] Fetching latest DB state for user: ${token.email || token.id}`);
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              organizationId: true,
              avatar: true,
              isActive: true,
              organization: {
                select: {
                  plan: true,
                  subscriptionStatus: true,
                  trialEndsAt: true,
                  subscriptionEndsAt: true,
                  gracePeriodEndsAt: true,
                  settings: true,
                  isDemo: true,
                  expiresAt: true,
                  clientFeePaid: true,
                },
              },
            },
          });
          if (dbUser) {
            // Handle demo expiration
            if (dbUser.organization?.isDemo && dbUser.organization.expiresAt && new Date(dbUser.organization.expiresAt) < new Date()) {
              console.log(`[DEMO] Organization ${dbUser.organizationId} expired, wiping...`);
              try {
                await prisma.organization.delete({ where: { id: dbUser.organizationId! } });
              } catch (e) {
                console.error("[DEMO] Failed to wipe expired org:", e);
              }
              return null;
            }

            if (!dbUser.isActive) {
              console.log(`[AUTH] Blocking disabled user: ${token.email}`);
              return null;
            }
            token.role = dbUser.role;
            token.organizationId = dbUser.organizationId;
            token.avatar = dbUser.avatar;

            if (dbUser.role === "CLIENT") {
              token.plan = "CLIENT";
              // Clients inherit the organization's status for lockout
              let status = dbUser.organization?.subscriptionStatus || "ACTIVE";
              if (dbUser.organization?.subscriptionEndsAt && new Date(dbUser.organization.subscriptionEndsAt) < new Date()) {
                status = "EXPIRED";
              }
              token.subscriptionStatus = status;
              token.sessionTimeout = "24h";
            } else if (dbUser.organization) {
              token.plan = dbUser.organization.plan;
              
              // 1 YEAR EXPIRATION LOCKOUT LOGIC
              let status = dbUser.organization.subscriptionStatus;
              if (dbUser.organization.subscriptionEndsAt && new Date(dbUser.organization.subscriptionEndsAt) < new Date()) {
                console.log(`[AUTH] Subscription expired for org ${token.organizationId}`);
                status = "EXPIRED";
              }
              
              token.subscriptionStatus = status;
              token.clientFeePaid = dbUser.organization.clientFeePaid;
              token.trialEndsAt = dbUser.organization.trialEndsAt?.toISOString();
              token.subscriptionEndsAt = dbUser.organization.subscriptionEndsAt?.toISOString();
              token.gracePeriodEndsAt = dbUser.organization.gracePeriodEndsAt?.toISOString();
              
              let parsedSettings: any = {};
              try {
                parsedSettings = JSON.parse(dbUser.organization.settings || "{}");
              } catch (e) {}
              token.sessionTimeout = parsedSettings.sessionTimeout || "30m";
            } else {
              token.plan = "STARTER";
              token.subscriptionStatus = "TRIALING";
              token.sessionTimeout = "30m";
            }
          } else {
            // User was deleted from DB but session is still active
            console.log(`[AUTH] User record missing from DB, invalidating session: ${token.id}`);
            return null;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).plan = token.plan as string;
        (session.user as any).subscriptionStatus = token.subscriptionStatus as string;
        (session.user as any).trialEndsAt = token.trialEndsAt as string;
        (session.user as any).subscriptionEndsAt = token.subscriptionEndsAt as string;
        (session.user as any).gracePeriodEndsAt = token.gracePeriodEndsAt as string;
        (session.user as any).organizationId = token.organizationId as string;
        (session.user as any).sessionTimeout = token.sessionTimeout as string;
        (session.user as any).clientFeePaid = token.clientFeePaid as boolean;
        if (token.avatar) {
          session.user.image = token.avatar as string;
        }
      }
      return session;
    },
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth attempt with credentials:", { email: credentials?.email });
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;
          
          if (!user.isActive) {
            throw new Error("Your account has been disabled. Please contact support.");
          }

          const passwordMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordMatch) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              plan: user.plan,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
});
