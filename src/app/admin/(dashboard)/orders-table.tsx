"use client";

import { useState } from "react";
import { getOrders, setOrderPaid, setOrderRejected, type OrderRow } from "./actions";

const TINTS = ["#FBF6DC", "#E9F2DF"];

function formatPhone(digits: string) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function OrdersTable({
  initialRows,
  initialDateFrom,
  initialDateTo,
}: {
  initialRows: OrderRow[];
  initialDateFrom: string;
  initialDateTo: string;
}) {
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [rows, setRows] = useState<OrderRow[]>(initialRows);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setRows(await getOrders(dateFrom, dateTo));
    } finally {
      setLoading(false);
    }
  }

  async function togglePaid(row: OrderRow) {
    const next = row.status !== "CONFIRMED";
    setRows((prev) =>
      prev.map((r) => (r.orderId === row.orderId ? { ...r, status: next ? "CONFIRMED" : "PENDING" } : r))
    );
    await setOrderPaid(row.orderId, next);
  }

  async function toggleRejected(row: OrderRow) {
    const next = row.status !== "REJECTED";
    setRows((prev) =>
      prev.map((r) => (r.orderId === row.orderId ? { ...r, status: next ? "REJECTED" : "PENDING" } : r))
    );
    await setOrderRejected(row.orderId, next);
  }

  const uniqNos = [...new Set(rows.map((r) => r.no))];

  return (
    <div>
      <h1 className="mb-4.5 font-serif text-[26px]">주문목록</h1>

      <div className="mb-4.5 flex flex-wrap items-end gap-2.5 rounded-[18px] border border-line bg-white p-4">
        <div>
          <label className="mb-1.5 block text-xs text-text-muted">주문일</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-[11px] border border-line bg-cream-card px-2.5 py-2.5 text-sm"
            />
            <span className="text-text-muted">~</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-[11px] border border-line bg-cream-card px-2.5 py-2.5 text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-[11px] bg-green px-6 py-3 text-sm font-bold text-white hover:bg-green-hover disabled:opacity-50"
        >
          {loading ? "조회 중..." : "조회"}
        </button>
        <div className="ml-auto text-[12.5px] text-text-muted">
          조회 결과 {rows.length}건
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-280 border-collapse text-[13px]">
            <thead>
              <tr className="bg-cream-soft text-left text-text-soft">
                <th className="whitespace-nowrap px-3 py-3 font-medium">주문번호</th>
                <th className="whitespace-nowrap px-2.5 py-3 font-medium">주문자</th>
                <th className="whitespace-nowrap px-2.5 py-3 font-medium">상품(갯수)</th>
                <th className="whitespace-nowrap px-2.5 py-3 font-medium">받는분</th>
                <th className="whitespace-nowrap px-2.5 py-3 font-medium">받는분 연락처</th>
                <th className="px-2.5 py-3 font-medium">주소</th>
                <th className="whitespace-nowrap px-2.5 py-3 font-medium">주문일시</th>
                <th className="whitespace-nowrap px-2.5 py-3 text-right font-medium">금액</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">입금확인</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">주문거절</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-text-muted">
                    조회된 주문이 없습니다.
                  </td>
                </tr>
              )}
              {rows.map((row, i) => {
                const isPaid = row.status === "CONFIRMED";
                const isRejected = row.status === "REJECTED";
                return (
                  <tr
                    key={row.orderId + i}
                    style={{ background: TINTS[uniqNos.indexOf(row.no) % 2] }}
                    className="border-t border-line/60"
                  >
                    <td
                      className="whitespace-nowrap px-3 py-3.5 tabular-nums"
                      style={{ textDecoration: isRejected ? "line-through" : "none", color: isRejected ? "#8C948C" : "#17281C" }}
                    >
                      {row.no}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-3.5">{row.orderer}</td>
                    <td className="whitespace-nowrap px-2.5 py-3.5 leading-relaxed">
                      {row.items.map((line, j) => (
                        <div key={j}>{line}</div>
                      ))}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-3.5">{row.receiver}</td>
                    <td className="whitespace-nowrap px-2.5 py-3.5">{formatPhone(row.phone)}</td>
                    <td
                      title={row.addr}
                      className="max-w-37.5 overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-3.5"
                    >
                      {row.addr}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-3.5 text-text-muted">{row.date}</td>
                    <td className="whitespace-nowrap px-2.5 py-3.5 text-right tabular-nums">
                      {row.amount.toLocaleString("ko-KR")}원
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => togglePaid(row)}
                        className="flex h-6.5 w-6.5 items-center justify-center rounded-lg text-[13px] text-white"
                        style={{
                          border: `1.5px solid ${isPaid ? "#2F6B4A" : "rgba(30,58,41,.3)"}`,
                          background: isPaid ? "#2F6B4A" : "transparent",
                        }}
                      >
                        {isPaid ? "✓" : ""}
                      </button>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRejected(row)}
                        className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs"
                        style={{
                          border: `1px solid ${isRejected ? "#B23A2E" : "rgba(30,58,41,.25)"}`,
                          background: isRejected ? "#F6D3C0" : "transparent",
                          color: isRejected ? "#A6482A" : "#4A5C4C",
                        }}
                      >
                        {isRejected ? "거절됨" : "거절"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-text-muted">
        같은 주문번호의 행은 같은 배경색으로 묶여 표시됩니다. 입금이 확인되면 체크박스를 눌러 확인표시로 바꿉니다.
      </p>
    </div>
  );
}
