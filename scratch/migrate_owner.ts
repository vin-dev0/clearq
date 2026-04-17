
import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();

async function migrate() {
  const result = await prisma.user.updateMany({
    where: { role: 'OWNER' as any }, // Using 'as any' because types might have changed
    data: { role: 'ADMIN' }
  });
  console.log(`Updated ${result.count} users from OWNER to ADMIN`);
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
