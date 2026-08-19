"use server";

import { prisma } from "@/lib/prisma";
import { generateOrderNo } from "@/lib/orderNo";

const SHIPPING = 4000;

export async function getCatalog() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      priceTiers: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return products
    .filter((p) => p.priceTiers.length > 0)
    .map((p) => ({
      productId: p.id,
      variety: p.name,
      tiers: p.priceTiers.map((t) => ({
        priceTierId: t.id,
        label: t.label,
        price: t.price,
      })),
    }));
}

export async function getBankAccount() {
  return prisma.bankAccount.findUnique({ where: { id: "singleton" } });
}

export type SubmitOrderCard = {
  name: string;
  phone: string;
  addr: string;
  items: Array<{ priceTierId: string; quantity: number }>;
};

export type SubmitOrderInput = {
  orderer: string;
  ordererPhone: string;
  cards: SubmitOrderCard[];
};

export async function submitOrder(input: SubmitOrderInput) {
  const cards = input.cards
    .map((card) => ({
      ...card,
      items: card.items.filter((item) => item.quantity > 0),
    }))
    .filter((card) => card.items.length > 0);

  if (cards.length === 0) {
    throw new Error("주문할 상품을 선택해 주세요.");
  }

  const priceTierIds = [...new Set(cards.flatMap((c) => c.items.map((i) => i.priceTierId)))];
  const priceTiers = await prisma.priceTier.findMany({
    where: { id: { in: priceTierIds } },
  });
  const priceTierMap = new Map(priceTiers.map((t) => [t.id, t]));

  let totalAmount = 0;
  const deliveriesData = cards.map((card) => {
    const items = card.items.map((item) => {
      const tier = priceTierMap.get(item.priceTierId);
      if (!tier) {
        throw new Error("존재하지 않는 상품입니다.");
      }
      const subtotal = tier.price * item.quantity;
      totalAmount += subtotal;
      return {
        productId: tier.productId,
        priceTierId: tier.id,
        quantity: item.quantity,
        unitPrice: tier.price,
        subtotal,
      };
    });
    return {
      receiverName: card.name || "받는분",
      receiverPhone: card.phone.replace(/[^0-9]/g, ""),
      address1: card.addr || "",
      items,
    };
  });

  if (totalAmount > 0) {
    totalAmount += SHIPPING * cards.length;
  }

  const order = await prisma.$transaction(async (tx) => {
    let orderNo = generateOrderNo();
    for (let attempt = 0; attempt < 3; attempt++) {
      const existing = await tx.order.findUnique({ where: { orderNo } });
      if (!existing) break;
      orderNo = generateOrderNo();
    }

    return tx.order.create({
      data: {
        orderNo,
        ordererName: input.orderer || "주문자",
        ordererPhone: input.ordererPhone.replace(/[^0-9]/g, ""),
        totalAmount,
        deliveries: {
          create: deliveriesData.map((d) => ({
            receiverName: d.receiverName,
            receiverPhone: d.receiverPhone,
            address1: d.address1,
            items: { create: d.items },
          })),
        },
      },
    });
  });

  return { orderNo: order.orderNo, totalAmount: order.totalAmount };
}
