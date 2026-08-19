"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type OrderRow = {
  orderId: string;
  no: string;
  orderer: string;
  items: string[];
  receiver: string;
  phone: string;
  addr: string;
  date: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
};

export async function getOrders(dateFrom: string, dateTo: string): Promise<OrderRow[]> {
  const from = new Date(`${dateFrom}T00:00:00`);
  const to = new Date(`${dateTo}T23:59:59.999`);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    include: {
      deliveries: {
        include: { items: { include: { product: true, priceTier: true } } },
      },
    },
  });

  const rows: OrderRow[] = [];
  for (const order of orders) {
    for (const delivery of order.deliveries) {
      const items = delivery.items.map((i) => `${i.product.name} ${i.priceTier.label} (${i.quantity})`);
      const amount = delivery.items.reduce((s, i) => s + i.subtotal, 0);
      rows.push({
        orderId: order.id,
        no: order.orderNo,
        orderer: order.ordererName,
        items,
        receiver: delivery.receiverName,
        phone: delivery.receiverPhone,
        addr: delivery.address1,
        date: order.createdAt.toISOString().slice(0, 16).replace("T", " "),
        amount,
        status: order.status,
      });
    }
  }
  return rows;
}

export async function setOrderPaid(orderId: string, paid: boolean) {
  await prisma.order.update({
    where: { id: orderId },
    data: paid
      ? { status: "CONFIRMED", confirmedAt: new Date() }
      : { status: "PENDING", confirmedAt: null },
  });
  revalidatePath("/admin");
}

export async function setOrderRejected(orderId: string, rejected: boolean) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: rejected ? "REJECTED" : "PENDING" },
  });
  revalidatePath("/admin");
}
