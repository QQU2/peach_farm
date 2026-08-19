import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const 황도 = await prisma.product.upsert({
    where: { id: "seed-hwangdo" },
    update: {},
    create: { id: "seed-hwangdo", name: "황도", displayOrder: 0 },
  });
  const 백도 = await prisma.product.upsert({
    where: { id: "seed-baekdo" },
    update: {},
    create: { id: "seed-baekdo", name: "백도", displayOrder: 1 },
  });

  const tiers: Array<{ id: string; productId: string; label: string; price: number; displayOrder: number }> = [
    { id: "seed-hwangdo-12-13", productId: 황도.id, label: "12 ~ 13 과", price: 40000, displayOrder: 0 },
    { id: "seed-hwangdo-13-14", productId: 황도.id, label: "13 ~ 14 과", price: 35000, displayOrder: 1 },
    { id: "seed-baekdo-12-13", productId: 백도.id, label: "12 ~ 13 과", price: 40000, displayOrder: 0 },
    { id: "seed-baekdo-15-16", productId: 백도.id, label: "15 ~ 16 과", price: 30000, displayOrder: 1 },
  ];

  for (const tier of tiers) {
    await prisma.priceTier.upsert({
      where: { id: tier.id },
      update: {},
      create: tier,
    });
  }

  await prisma.bankAccount.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      bankName: "복복은행",
      holder: "석 정 아",
      accountNo: "100-000-121234",
      phone: "010-0000-1111",
    },
  });

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
