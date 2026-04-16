const { PrismaClient } = require('@prisma/client');
async function test() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log('✅ Database Connected - Users:', count);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('❌ Database Error:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}
test();