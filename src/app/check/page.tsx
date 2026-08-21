"use client";

import Link from "next/link";
import { useState } from "react";
import { lookupOrderByNo, lookupOrdersByOrderer } from "./actions";
import type { OrderDetail } from "@/lib/orderDetail";
import OrderDetailCard from "@/components/OrderDetailCard";

type Mode = "orderNo" | "orderer";

function onlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 11);
}

function formatPhone(digits: string) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function CheckOrderPage() {
  const [mode, setMode] = useState<Mode>("orderNo");
  const [orderNoInput, setOrderNoInput] = useState("");
  const [ordererName, setOrdererName] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [results, setResults] = useState<OrderDetail[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setResults(null);
    setSearched(false);
    setError(null);
  }

  async function lookup() {
    setLoading(true);
    setError(null);
    try {
      if (mode === "orderNo") {
        if (!orderNoInput.trim()) return;
        const found = await lookupOrderByNo(orderNoInput);
        setResults(found ? [found] : []);
      } else {
        if (!ordererName.trim() || !ordererPhone.trim()) return;
        const found = await lookupOrdersByOrderer(ordererName, ordererPhone);
        setResults(found);
      }
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "조회 중 오류가 발생했습니다.");
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
          주문번호 또는 주문자 정보로 조회할 수 있어요.
        </p>

        <div className="mb-3.5 flex items-center gap-5 text-[14px]">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={mode === "orderNo"} onChange={() => switchMode("orderNo")} />
            주문번호
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={mode === "orderer"} onChange={() => switchMode("orderer")} />
            주문자 + 전화번호
          </label>
        </div>

        {mode === "orderNo" ? (
          <div className="mb-5 flex gap-2.5">
            <input
              value={orderNoInput}
              onChange={(e) => setOrderNoInput(e.target.value)}
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
        ) : (
          <div className="mb-5 flex gap-2.5">
            <div className="flex min-w-0 flex-1 gap-2.5">
              <input
                value={ordererName}
                onChange={(e) => setOrdererName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                placeholder="주문자 성명"
                className="min-w-0 flex-3 rounded-2xl border border-line bg-white px-3.5 py-3.5 text-[15px]"
              />
              <input
                value={formatPhone(ordererPhone)}
                onChange={(e) => setOrdererPhone(onlyDigits(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                inputMode="numeric"
                placeholder="주문자 연락처"
                className="min-w-0 flex-7 rounded-2xl border border-line bg-white px-3.5 py-3.5 text-[15px]"
              />
            </div>
            <button
              type="button"
              onClick={lookup}
              disabled={loading}
              className="rounded-2xl bg-green px-5.5 text-[15px] font-bold text-white hover:bg-green-hover disabled:opacity-50"
            >
              {loading ? "조회 중..." : "조회"}
            </button>
          </div>
        )}

        {error && <p className="mb-4 text-sm text-peach">{error}</p>}

        {searched && results && results.length === 0 && (
          <div className="rounded-[18px] border border-dashed border-line px-6.5 py-7 text-center text-[13.5px] text-text-muted">
            해당하는 주문을 찾지 못했습니다.
          </div>
        )}

        {results && results.length > 0 && (
          <div className="flex flex-col gap-3.5">
            {results.map((order) => (
              <OrderDetailCard key={order.orderNo} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
