const { PrismaClient } = require('@prisma/client');
const bugandaClans = require('./data/bugandaClans');
const rbacSeed = require('./data/rbacSeed');

const prisma = new PrismaClient();

async function seedClans() {
  const canonicalNames = bugandaClans.map((c) => c.name);

  for (const clan of bugandaClans) {
    await prisma.clan.upsert({
      where: { name: clan.name },
      update: {
        totem: clan.totem,
        description: clan.description || `The ${clan.name} clan — totem: ${clan.totem}`
      },
      create: {
        name: clan.name,
        totem: clan.totem,
        description: clan.description || `The ${clan.name} clan — totem: ${clan.totem}`
      }
    });
  }

  const legacyClans = await prisma.clan.findMany({
    where: { name: { notIn: canonicalNames } },
    include: { _count: { select: { individuals: true } } }
  });

  for (const legacy of legacyClans) {
    if (legacy._count.individuals === 0) {
      await prisma.clan.delete({ where: { id: legacy.id } });
    }
  }

  const count = await prisma.clan.count();
  console.log(`Seeded ${bugandaClans.length} Buganda clans (${count} total in database)`);
}

async function seedRbac() {
  for (const role of rbacSeed.roles) {
    await prisma.roleDefinition.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role
    });
  }

  for (const permission of rbacSeed.permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission
    });
  }

  const roles = await prisma.roleDefinition.findMany();
  const permissions = await prisma.permission.findMany();
  const roleByName = Object.fromEntries(roles.map((r) => [r.name, r]));
  const permByName = Object.fromEntries(permissions.map((p) => [p.name, p]));

  for (const [roleName, permNames] of Object.entries(rbacSeed.rolePermissions)) {
    const role = roleByName[roleName];
    if (!role) continue;

    for (const permName of permNames) {
      const permission = permByName[permName];
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: role.id,
            permission_id: permission.id
          }
        },
        update: {},
        create: {
          role_id: role.id,
          permission_id: permission.id
        }
      });
    }
  }

  console.log(`Seeded ${roles.length} roles and ${permissions.length} permissions`);
}

async function main() {
  await seedClans();
  await seedRbac();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
