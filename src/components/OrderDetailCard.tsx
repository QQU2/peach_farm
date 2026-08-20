import type { ReactNode } from "react";
import type { OrderDetail } from "@/lib/orderDetail";

const won = (n: number) => n.toLocaleString("ko-KR");

export default function OrderDetailCard({
  order,
  headerAction,
}: {
  order: OrderDetail;
  headerAction?: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-line bg-cream-card p-5" style={{ animation: "pop .28s ease both" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[11.5px] tracking-[0.16em] text-text-muted">주문번호</div>
          <div className="font-serif text-xl font-bold">{order.orderNo}</div>
        </div>
        {headerAction}
      </div>

      <div className="flex flex-col gap-3">
        {order.deliveries.map((d, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-3.5">
            <div className="mb-1.5 text-xs font-bold tracking-[0.14em] text-green">배송지 {i + 1}</div>
            <div className="mb-1.5 text-[13px] text-text-muted">
              {d.receiverName} · {d.address}
            </div>
            <div className="flex flex-col gap-0.5 text-[14px] leading-[1.6]">
              {d.items.map((item, itemIndex) => (
                <div key={itemIndex}>{item}</div>
              ))}
            </div>
            <div className="mt-2.5 flex justify-between border-t border-dashed border-line pt-2.5 text-[13px] text-text-soft">
              <span>소계</span>
              <strong className="text-forest">{won(d.subtotal)}원</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3.5 text-[13.5px] text-text-soft">
        <span>총 배송비</span>
        <span>{won(order.shippingTotal)} 원</span>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-[13.5px] text-text-soft">총 금액</span>
        <strong className="font-serif text-xl">{won(order.totalAmount)} 원</strong>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[13px] text-text-muted">입금상태</span>
        <span
          className="rounded-full px-2.5 py-1 text-[12.5px] font-bold"
          style={{ background: order.status.bg, color: order.status.fg }}
        >
          {order.status.label}
        </span>
      </div>
    </div>
  );
}
