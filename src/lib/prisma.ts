import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use a timestamp or unique identifier to force a refresh during development
export const prisma = (process.env.NODE_ENV === "development") 
  ? new PrismaClient() 
  : (globalForPrisma.prisma ?? new PrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
