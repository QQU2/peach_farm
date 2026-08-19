"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { displayOrder: "asc" },
    include: { priceTiers: { orderBy: { displayOrder: "asc" } } },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    rows: p.priceTiers.map((t) => ({ id: t.id, size: t.label, price: t.price, on: t.isActive })),
  }));
}

export async function getBankAccount() {
  return prisma.bankAccount.findUnique({ where: { id: "singleton" } });
}

export async function createProductWithTiers(
  name: string,
  rows: Array<{ size: string; price: number; on: boolean }>
) {
  const count = await prisma.product.count();
  await prisma.product.create({
    data: {
      name,
      displayOrder: count,
      priceTiers: {
        create: rows.map((r, i) => ({
          label: r.size,
          price: r.price,
          isActive: r.on,
          displayOrder: i,
        })),
      },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/order");
}

export async function renameProduct(id: string, name: string) {
  await prisma.product.update({ where: { id }, data: { name } });
  revalidatePath("/admin/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function addPriceTier(productId: string) {
  const count = await prisma.priceTier.count({ where: { productId } });
  await prisma.priceTier.create({
    data: { productId, label: "", price: 0, isActive: true, displayOrder: count },
  });
  revalidatePath("/admin/products");
}

export async function updatePriceTier(
  id: string,
  patch: { size?: string; price?: number; on?: boolean }
) {
  await prisma.priceTier.update({
    where: { id },
    data: {
      ...(patch.size !== undefined ? { label: patch.size } : {}),
      ...(patch.price !== undefined ? { price: patch.price } : {}),
      ...(patch.on !== undefined ? { isActive: patch.on } : {}),
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/order");
}

export async function saveBankAccount(data: {
  bankName: string;
  holder: string;
  accountNo: string;
  phone: string;
}) {
  await prisma.bankAccount.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidatePath("/admin/products");
  revalidatePath("/order");
}
