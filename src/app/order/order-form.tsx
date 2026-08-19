"use client";

import Link from "next/link";
import { useState } from "react";
import { submitOrder } from "./actions";

type CatalogTier = { priceTierId: string; label: string; price: number };
type CatalogProduct = { productId: string; variety: string; tiers: CatalogTier[] };

type FlatTier = CatalogTier & { variety: string; productId: string };

type BankAccount = {
  bankName: string;
  holder: string;
  accountNo: string;
  phone: string;
} | null;

const CHIP: Record<string, { bg: string; fg: string }> = {
  황도: { bg: "#F8E0C7", fg: "#8A5A22" },
  백도: { bg: "#F7DDE2", fg: "#8E4356" },
};
const DEFAULT_CHIP = { bg: "#E3EEDF", fg: "#3E6B4A" };

const SHIPPING = 4000;

type DeliveryCard = {
  name: string;
  phone: string;
  addr: string;
  qty: Record<string, number>;
};

const won = (n: number) => n.toLocaleString("ko-KR");
const newCard = (): DeliveryCard => ({ name: "", phone: "", addr: "", qty: {} });

function onlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 11);
}

function formatPhone(digits: string) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function cardTotal(card: DeliveryCard, tiers: FlatTier[]) {
  return tiers.reduce((sum, t) => sum + (Number(card.qty[t.priceTierId]) || 0) * t.price, 0);
}

function itemsLabel(card: DeliveryCard, tiers: FlatTier[]) {
  const parts = tiers
    .map((t) => {
      const q = Number(card.qty[t.priceTierId]) || 0;
      return q > 0 ? `${t.variety} ${t.label} (${q}개)` : null;
    })
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : "선택한 상품 없음";
}

export default function OrderForm({
  catalog,
  bankAccount,
}: {
  catalog: CatalogProduct[];
  bankAccount: BankAccount;
}) {
  const tiers: FlatTier[] = catalog.flatMap((p) =>
    p.tiers.map((t) => ({ ...t, variety: p.variety, productId: p.productId }))
  );

  const [orderer, setOrderer] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [cards, setCards] = useState<DeliveryCard[]>([newCard()]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [copyLabel, setCopyLabel] = useState("복사");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsTotal = cards.reduce((s, c) => s + cardTotal(c, tiers), 0);
  const totalQty = cards.reduce(
    (s, c) => s + tiers.reduce((a, t) => a + (Number(c.qty[t.priceTierId]) || 0), 0),
    0
  );
  const shippingCardCount = cards.filter((c) => cardTotal(c, tiers) > 0).length;
  const shippingTotal = shippingCardCount * SHIPPING;
  const grandTotal = itemsTotal > 0 ? itemsTotal + shippingTotal : 0;

  function patchCard(i: number, patch: Partial<DeliveryCard>) {
    setCards((prev) => prev.map((c, k) => (k === i ? { ...c, ...patch } : c)));
  }

  function setQty(cardIndex: number, priceTierId: string, value: number) {
    patchCard(cardIndex, {
      qty: { ...cards[cardIndex].qty, [priceTierId]: value },
    });
  }

  function removeCard(i: number) {
    setCards((prev) => (prev.length > 1 ? prev.filter((_, k) => k !== i) : prev));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitOrder({
        orderer,
        ordererPhone,
        cards: cards.map((c) => ({
          name: c.name,
          phone: c.phone,
          addr: c.addr,
          items: tiers.map((t) => ({
            priceTierId: t.priceTierId,
            quantity: Number(c.qty[t.priceTierId]) || 0,
          })),
        })),
      });
      setOrderNo(result.orderNo);
      setShowConfirm(false);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "주문 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main
        className="flex flex-1 justify-center px-5 py-7 pb-15"
        style={{ background: "linear-gradient(180deg, #CFE6EE, #F7F0E4)" }}
      >
        <div className="w-full max-w-135">
          <div className="mb-5.5 text-center">
            <div className="text-4xl">✨</div>
            <h2 className="my-2 font-serif text-[clamp(26px,7vw,32px)] leading-snug">
              주문이 완료되었습니다
            </h2>
            <p className="text-sm leading-[1.75] text-text-soft">
              아래의 계좌에 입금해주시면
              <br />
              맛있는 복숭아를 빠르게 배송해 드릴게요 🚀
            </p>
          </div>

          {bankAccount && (
            <div className="mb-3.5 rounded-[22px] bg-forest p-5.5 text-cream shadow-[0_20px_44px_-26px_rgba(47,107,74,.9)]">
              <div className="mb-3 text-[11.5px] tracking-[0.18em] text-cream/70">입금 계좌</div>
              <div className="flex flex-col gap-2.5 text-[15px]">
                <div className="flex gap-3.5">
                  <span className="w-16 text-[13px] text-cream/70">은행</span>
                  <strong className="font-medium">{bankAccount.bankName}</strong>
                </div>
                <div className="flex gap-3.5">
                  <span className="w-16 text-[13px] text-cream/70">계좌번호</span>
                  <strong className="tracking-[0.02em]">{bankAccount.accountNo}</strong>
                </div>
                <div className="flex gap-3.5">
                  <span className="w-16 text-[13px] text-cream/70">예금주</span>
                  <strong className="font-medium">{bankAccount.holder}</strong>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-peach/40 bg-peach/15 px-3.5 py-3 text-[13px] leading-[1.7] text-cream/90">
                입금 문의 연락처 : {bankAccount.phone}
              </div>
            </div>
          )}

          <div className="mb-3.5 rounded-[22px] border border-line bg-cream-card p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11.5px] tracking-[0.16em] text-text-muted">주문번호</div>
                <div className="font-serif text-xl font-bold tracking-[0.01em]">{orderNo}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(orderNo);
                  setCopyLabel("복사됨");
                  setTimeout(() => setCopyLabel("복사"), 1500);
                }}
                className="rounded-full border border-line px-3.5 py-2 text-[12.5px]"
              >
                {copyLabel}
              </button>
            </div>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex gap-3.5">
                <span className="w-[58px] text-[13px] text-text-muted">상품</span>
                <span>{itemsLabel(cards[0], tiers)}</span>
              </div>
              <div className="flex gap-3.5">
                <span className="w-[58px] text-[13px] text-text-muted">금액</span>
                <strong>{won(grandTotal)} 원</strong>
              </div>
              <div className="flex gap-3.5">
                <span className="w-[58px] text-[13px] text-text-muted">주소</span>
                <span>
                  {cards[0].addr || "주소 미입력"}
                  {cards.length > 1 ? ` 외 ${cards.length - 1}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <span className="w-[58px] text-[13px] text-text-muted">입금상태</span>
                <span className="rounded-full bg-[#F6D3C0] px-2.5 py-1 text-[12.5px] font-bold text-[#A6482A]">
                  미입금
                </span>
              </div>
            </div>
          </div>
          <p className="mb-4.5 text-center text-[12.5px] leading-[1.7] text-text-muted">
            입금되는대로 출고하며, 출고 이후 다음날 배송 받으실 수 있습니다.
          </p>
          <Link
            href="/"
            className="flex h-14 items-center justify-center rounded-full border-[1.5px] border-line text-base font-medium"
          >
            메인화면
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex flex-1 justify-center pb-7"
      style={{ background: "linear-gradient(180deg, #E4EFE2, #F7F0E4)" }}
    >
      <div className="flex w-full max-w-140 flex-col">
        <div className="flex items-center justify-between px-5 pb-3.5 pt-4.5">
          <Link href="/" className="text-sm text-text-soft">
            ← 뒤로
          </Link>
          <h1 className="font-serif text-[22px]">주문서</h1>
          <span className="text-[12.5px] text-text-muted">카드 {cards.length}장</span>
        </div>

        <div className="px-5 pb-3.5">
          <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-cream-card px-4 py-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">주문자</label>
              <input
                value={orderer}
                onChange={(e) => setOrderer(e.target.value)}
                placeholder="주문자 성명 입력"
                className="w-full border-0 border-b-[1.5px] border-forest/20 bg-transparent py-1.5 text-base focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">주문자 연락처</label>
              <input
                value={formatPhone(ordererPhone)}
                onChange={(e) => setOrdererPhone(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder="주문자 연락처 입력"
                className="w-full border-0 border-b-[1.5px] border-forest/20 bg-transparent py-1.5 text-base focus:outline-none"
              />
            </div>
          </div>
        </div>

        {tiers.length === 0 ? (
          <div className="mx-5 rounded-[18px] border border-dashed border-line bg-white/60 px-6 py-10 text-center text-sm text-text-muted">
            아직 등록된 상품이 없습니다. 관리자 페이지에서 상품을 먼저 등록해 주세요.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-5 pb-1" style={{ scrollSnapType: "x mandatory" }}>
            {cards.map((card, i) => (
              <div
                key={i}
                className="flex-none rounded-[22px] border border-line bg-cream-card p-5 shadow-[0_18px_44px_-30px_rgba(23,40,28,.5)]"
                style={{ scrollSnapAlign: "center", flexBasis: "min(100%, 480px)" }}
              >
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.14em] text-green">배송지 {i + 1}</span>
                  {cards.length > 1 && (
                    <button type="button" onClick={() => removeCard(i)} className="text-xs text-text-muted">
                      삭제
                    </button>
                  )}
                </div>
                <div className="mb-5 flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">받는 분</label>
                    <input
                      value={card.name}
                      onChange={(e) => patchCard(i, { name: e.target.value })}
                      placeholder="받는 분 성함 입력"
                      className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">연락처</label>
                    <input
                      value={formatPhone(card.phone)}
                      onChange={(e) => patchCard(i, { phone: onlyDigits(e.target.value) })}
                      inputMode="numeric"
                      placeholder="받는 분 연락처 입력"
                      className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">주소</label>
                    <input
                      value={card.addr}
                      onChange={(e) => patchCard(i, { addr: e.target.value })}
                      placeholder="받는 분 주소 입력"
                      className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px]"
                    />
                  </div>
                </div>
                <div className="mb-2.5 text-xs font-bold tracking-[0.14em] text-green">상품</div>
                <div className="flex flex-col gap-2">
                  {tiers.map((t) => {
                    const chip = CHIP[t.variety] ?? DEFAULT_CHIP;
                    const qty = Number(card.qty[t.priceTierId]) || 0;
                    return (
                      <div
                        key={t.priceTierId}
                        className="flex items-center gap-2.5 rounded-2xl border border-line bg-white px-3.5 py-2.5"
                      >
                        <span
                          className="flex-none rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold"
                          style={{ background: chip.bg, color: chip.fg }}
                        >
                          {t.variety}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14.5px] font-medium">{t.label}</div>
                          <div className="text-xs text-text-muted">{won(t.price)}원</div>
                        </div>
                        <div className="flex flex-none items-center gap-0.5 overflow-hidden rounded-[10px] border border-line">
                          <button
                            type="button"
                            onClick={() => setQty(i, t.priceTierId, Math.max(0, qty - 1))}
                            className="h-8.5 w-8 bg-cream-soft text-base"
                          >
                            −
                          </button>
                          <input
                            value={qty}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, "");
                              setQty(i, t.priceTierId, v === "" ? 0 : Number(v));
                            }}
                            inputMode="numeric"
                            className="w-9.5 border-0 py-2 text-center text-[15px] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQty(i, t.priceTierId, qty + 1)}
                            className="h-8.5 w-8 bg-cream-soft text-base"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3.5 flex justify-between border-t border-dashed border-line pt-3 text-[13.5px] text-text-soft">
                  <span>배송지 {i + 1} 소계</span>
                  <strong className="text-forest">{won(cardTotal(card, tiers))}원</strong>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCards((prev) => [...prev, newCard()])}
              className="min-h-55 flex-none self-stretch rounded-[22px] border-[1.5px] border-dashed border-line bg-white/50 text-[26px] text-green hover:bg-white"
              style={{ flexBasis: "84px" }}
            >
              +
            </button>
          </div>
        )}

        <div className="sticky bottom-0 mt-3.5 border-t border-line bg-cream/95 px-5 pb-4.5 pt-4 backdrop-blur-md">
          {error && <p className="mb-2 text-sm text-peach">{error}</p>}
          <div className="mb-1.5 flex items-baseline justify-between text-[13.5px] text-text-soft">
            <span>배송비 {shippingCardCount > 0 ? `(배송지 ${shippingCardCount}곳 × ${won(SHIPPING)}원)` : ""}</span>
            <span>{won(shippingTotal)} 원</span>
          </div>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[13.5px] text-text-soft">총 {totalQty}개</span>
            <span className="font-serif text-[26px] font-bold">
              총 {won(grandTotal)}
              <span className="text-base font-normal"> 원</span>
            </span>
          </div>
          <button
            type="button"
            disabled={totalQty === 0}
            onClick={() => setShowConfirm(true)}
            className="h-14 w-full rounded-full bg-peach text-[17px] font-bold text-white shadow-[0_14px_28px_-14px_rgba(232,132,92,.9)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            주문하기
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest/45 p-5" style={{ animation: "fade .2s ease both" }}>
          <div
            className="max-h-[82vh] w-full max-w-120 overflow-y-auto rounded-3xl bg-cream-card p-6"
            style={{ animation: "pop .28s ease both" }}
          >
            <h3 className="mb-1 font-serif text-[21px]">주문 내용 확인</h3>
            <p className="mb-4.5 text-[13px] text-text-muted">배송지와 상품을 확인해 주세요.</p>
            <div className="flex flex-col gap-3">
              {cards.map((card, i) => (
                <div key={i} className="rounded-2xl border border-line bg-white p-3.5">
                  <div className="mb-0.5 text-[14.5px] font-bold">{card.name || "받는분"}</div>
                  <div className="text-[12.5px] leading-relaxed text-text-muted">
                    {card.phone ? formatPhone(card.phone) : "연락처 미입력"}
                    <br />
                    {card.addr || "주소 미입력"}
                  </div>
                  <div className="mt-2.5 border-t border-dashed border-line pt-2.5 text-[13.5px] leading-[1.7]">
                    {itemsLabel(card, tiers)}
                  </div>
                </div>
              ))}
            </div>
            <div className="my-4.5 flex items-baseline justify-between">
              <span className="text-[13.5px] text-text-soft">결제 예정 금액</span>
              <strong className="font-serif text-2xl">{won(grandTotal)} 원</strong>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="h-13 flex-1 rounded-full border-[1.5px] border-line text-[15px]"
              >
                수정하기
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="h-13 flex-[1.4] rounded-full bg-green text-base font-bold text-white hover:bg-green-hover disabled:opacity-50"
              >
                {submitting ? "처리 중..." : "주문 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
