export const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  PENDING: { label: "미입금", bg: "#F6D3C0", fg: "#A6482A" },
  CONFIRMED: { label: "입금확인", bg: "#DCEFDD", fg: "#2F6B4A" },
  REJECTED: { label: "입금거절", bg: "#EADCDC", fg: "#8C4A4A" },
  CANCELLED: { label: "주문취소", bg: "#E5E2DA", fg: "#6C7C6D" },
};

export type OrderDetail = {
  orderNo: string;
  totalAmount: number;
  shippingTotal: number;
  status: { label: string; bg: string; fg: string };
  deliveries: Array<{
    receiverName: string;
    address: string;
    items: string[];
    subtotal: number;
  }>;
};

type OrderWithDetails = {
  orderNo: string;
  totalAmount: number;
  status: string;
  deliveries: Array<{
    receiverName: string;
    address1: string;
    items: Array<{
      quantity: number;
      subtotal: number;
      product: { name: string };
      priceTier: { label: string };
    }>;
  }>;
};

export function buildOrderDetail(order: OrderWithDetails): OrderDetail {
  const deliveries = order.deliveries.map((d) => ({
    receiverName: d.receiverName || "받는분",
    address: d.address1 || "주소 미입력",
    items: d.items.length
      ? d.items.map((i) => `${i.product.name} ${i.priceTier.label} (${i.quantity}개)`)
      : ["선택한 상품 없음"],
    subtotal: d.items.reduce((s, i) => s + i.subtotal, 0),
  }));

  const itemsSubtotalSum = deliveries.reduce((s, d) => s + d.subtotal, 0);

  return {
    orderNo: order.orderNo,
    totalAmount: order.totalAmount,
    shippingTotal: order.totalAmount - itemsSubtotalSum,
    status: STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING,
    deliveries,
  };
}
