"use server";

import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  PENDING: { label: "미입금", bg: "#F6D3C0", fg: "#A6482A" },
  CONFIRMED: { label: "입금확인", bg: "#DCEFDD", fg: "#2F6B4A" },
  REJECTED: { label: "입금거절", bg: "#EADCDC", fg: "#8C4A4A" },
  CANCELLED: { label: "주문취소", bg: "#E5E2DA", fg: "#6C7C6D" },
};

export async function lookupOrder(orderNo: string) {
  const order = await prisma.order.findUnique({
    where: { orderNo: orderNo.trim() },
    include: {
      deliveries: {
        include: { items: { include: { product: true, priceTier: true } } },
      },
    },
  });

  if (!order) return null;

  const allItems = order.deliveries.flatMap((d) => d.items);
  const itemsLabel = allItems.length
    ? allItems.map((i) => `${i.product.name} ${i.priceTier.label} (${i.quantity}개)`).join(" · ")
    : "선택한 상품 없음";

  const firstAddr = order.deliveries[0]?.address1 || "주소 미입력";
  const addr = order.deliveries.length > 1 ? `${firstAddr} 외 ${order.deliveries.length - 1}` : firstAddr;

  const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING;

  return {
    orderNo: order.orderNo,
    items: itemsLabel,
    amount: order.totalAmount,
    addr,
    status,
  };
}
