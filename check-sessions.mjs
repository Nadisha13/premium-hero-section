import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.session.findMany();
  console.log("=== Sessions ===");
  console.log(JSON.stringify(sessions, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
  
  const subs = await prisma.shopSubscription.findMany();
  console.log("\n=== ShopSubscriptions ===");
  console.log(JSON.stringify(subs, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
