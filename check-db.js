import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Testing Prisma database connection...');
  try {
    const sessions = await prisma.session.findMany({ take: 5 });
    console.log('Successfully connected! Sessions count:', sessions.length);
  } catch (error) {
    console.error('Connection failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
