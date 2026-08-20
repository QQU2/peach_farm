"use server";

import { prisma } from "@/lib/prisma";
import { buildOrderDetail, type OrderDetail } from "@/lib/orderDetail";

const DELIVERY_INCLUDE = {
  deliveries: {
    include: { items: { include: { product: true, priceTier: true } } },
  },
} as const;

export async function lookupOrderByNo(orderNo: string): Promise<OrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { orderNo: orderNo.trim() },
    include: DELIVERY_INCLUDE,
  });

  return order ? buildOrderDetail(order) : null;
}

export async function lookupOrdersByOrderer(name: string, phone: string): Promise<OrderDetail[]> {
  const orders = await prisma.order.findMany({
    where: {
      deliveries: {
        some: {
          ordererName: name.trim(),
          ordererPhone: phone.replace(/[^0-9]/g, ""),
        },
      },
    },
    include: DELIVERY_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(buildOrderDetail);
}
