"use client";

import Link from "next/link";
import { useState } from "react";
import { lookupOrder } from "./actions";

type LookupResult = Awaited<ReturnType<typeof lookupOrder>>;

const won = (n: number) => n.toLocaleString("ko-KR");

export default function CheckOrderPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<LookupResult>(null);
  const [miss, setMiss] = useState(false);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const found = await lookupOrder(input);
      setResult(found);
      setMiss(!found);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex flex-1 justify-center px-5 py-7 pb-15"
      style={{ background: "linear-gradient(180deg, #E4EFE2, #F7F0E4)" }}
    >
      <div className="w-full max-w-135">
        <Link href="/" className="mb-3.5 inline-block text-sm text-text-soft">
          ← 메인
        </Link>
        <h1 className="mb-1.5 font-serif text-[28px]">주문 조회</h1>
        <p className="mb-5 text-[13.5px] text-text-muted">
          주문 완료 화면에서 받은 주문번호를 입력해 주세요.
        </p>
        <div className="mb-5 flex gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="주문번호"
            className="min-w-0 flex-1 rounded-2xl border border-line bg-white px-3.5 py-3.5 text-[15px]"
          />
          <button
            type="button"
            onClick={lookup}
            disabled={loading}
            className="rounded-2xl bg-green px-5.5 text-[15px] font-bold text-white hover:bg-green-hover disabled:opacity-50"
          >
            {loading ? "조회 중..." : "조회"}
          </button>
        </div>

        {miss && (
          <div className="rounded-[18px] border border-dashed border-line px-6.5 py-7 text-center text-[13.5px] text-text-muted">
            해당 주문번호의 주문을 찾지 못했습니다.
          </div>
        )}

        {result && (
          <div className="rounded-[22px] border border-line bg-cream-card p-5" style={{ animation: "pop .28s ease both" }}>
            <div className="text-[11.5px] tracking-[0.16em] text-text-muted">주문번호</div>
            <div className="mb-4 font-serif text-xl font-bold">{result.orderNo}</div>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex gap-3.5">
                <span className="w-14.5 text-[13px] text-text-muted">상품</span>
                <span>{result.items}</span>
              </div>
              <div className="flex gap-3.5">
                <span className="w-14.5 text-[13px] text-text-muted">금액</span>
                <strong>{won(result.amount)} 원</strong>
              </div>
              <div className="flex gap-3.5">
                <span className="w-14.5 text-[13px] text-text-muted">주소</span>
                <span>{result.addr}</span>
              </div>
              <div className="flex items-center gap-3.5">
                <span className="w-14.5 text-[13px] text-text-muted">입금상태</span>
                <span
                  className="rounded-full px-2.5 py-1 text-[12.5px] font-bold"
                  style={{ background: result.status.bg, color: result.status.fg }}
                >
                  {result.status.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
