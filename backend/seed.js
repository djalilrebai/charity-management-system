// prisma/seed.js أو backend/seed.js
// تشغيل: node seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // 1. إنشاء الأدوار الأساسية (roles) — الأربعة موجودين في الـ schema
  const roleNames = ['admin', 'secretary', 'accountant', 'viewer'];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. الحسابات اللي تحب تنشئها (admin, secretary, viewer)
  const usersToCreate = [
    { username: 'admin', password: 'Admin@123', role: 'admin' },
    { username: 'secretary', password: 'Secretary@123', role: 'secretary' },
    { username: 'viewer', password: 'Viewer@123', role: 'viewer' },
	{ username: 'kada', password: 'kada', role: 'admin' },
  ];

  for (const u of usersToCreate) {
    const role = await prisma.role.findUnique({ where: { name: u.role } });
    const passwordHash = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        passwordHash,
        roleId: role.id,
      },
    });

    console.log(`✔ تم إنشاء المستخدم: ${u.username} (${u.role}) — كلمة السر: ${u.password}`);
  }

  console.log('\n⚠️ غيّر كلمات السر هاذي مباشرة بعد أول دخول، خاصة قبل النشر الحقيقي.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
