"use client";

import { useState } from "react";
import {
  addPriceTier,
  createProductWithTiers,
  deleteProduct,
  getBankAccount,
  getProducts,
  renameProduct,
  saveBankAccount,
  updatePriceTier,
} from "./actions";

type PriceRow = { id: string; size: string; price: number; on: boolean };
type ProductDraft = { id: string; name: string; rows: PriceRow[] };
type Acc = { bankName: string; holder: string; accountNo: string; phone: string };

type NewRow = { localId: string; size: string; price: number; on: boolean };
type NewProduct = { localId: string; name: string; rows: NewRow[] };

const newRow = (): NewRow => ({ localId: crypto.randomUUID(), size: "", price: 0, on: true });

export default function ProductsForm({
  initialProducts,
  initialAccount,
}: {
  initialProducts: ProductDraft[];
  initialAccount: Acc;
}) {
  const [products, setProducts] = useState<ProductDraft[]>(initialProducts);
  const [newProducts, setNewProducts] = useState<NewProduct[]>([]);
  const [savingLocalId, setSavingLocalId] = useState<string | null>(null);
  const [acc, setAcc] = useState<Acc>(initialAccount);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      const [p, bank] = await Promise.all([getProducts(), getBankAccount()]);
      setProducts(p);
      if (bank) setAcc({ bankName: bank.bankName, holder: bank.holder, accountNo: bank.accountNo, phone: bank.phone });
    } finally {
      setLoading(false);
    }
  }

  function updateLocalName(pIndex: number, name: string) {
    setProducts((prev) => prev.map((p, i) => (i === pIndex ? { ...p, name } : p)));
  }

  function updateLocalRow(pIndex: number, rIndex: number, patch: Partial<PriceRow>) {
    setProducts((prev) =>
      prev.map((p, i) =>
        i === pIndex ? { ...p, rows: p.rows.map((r, j) => (j === rIndex ? { ...r, ...patch } : r)) } : p
      )
    );
  }

  async function handleToggle(pIndex: number, rIndex: number) {
    const row = products[pIndex].rows[rIndex];
    updateLocalRow(pIndex, rIndex, { on: !row.on });
    await updatePriceTier(row.id, { on: !row.on });
  }

  async function handleDelete(product: ProductDraft) {
    if (!confirm(`'${product.name || "이름 없는 상품"}'을(를) 삭제하시겠습니까?`)) return;
    await deleteProduct(product.id);
    reload();
  }

  function addDraftProduct() {
    setNewProducts((prev) => [...prev, { localId: crypto.randomUUID(), name: "", rows: [newRow()] }]);
  }

  function updateDraftName(localId: string, name: string) {
    setNewProducts((prev) => prev.map((d) => (d.localId === localId ? { ...d, name } : d)));
  }

  function updateDraftRow(productLocalId: string, rowLocalId: string, patch: Partial<NewRow>) {
    setNewProducts((prev) =>
      prev.map((d) =>
        d.localId === productLocalId
          ? { ...d, rows: d.rows.map((r) => (r.localId === rowLocalId ? { ...r, ...patch } : r)) }
          : d
      )
    );
  }

  function addDraftRow(productLocalId: string) {
    setNewProducts((prev) =>
      prev.map((d) => (d.localId === productLocalId ? { ...d, rows: [...d.rows, newRow()] } : d))
    );
  }

  function cancelDraft(localId: string) {
    setNewProducts((prev) => prev.filter((d) => d.localId !== localId));
  }

  async function saveDraft(draft: NewProduct) {
    setSavingLocalId(draft.localId);
    try {
      await createProductWithTiers(
        draft.name,
        draft.rows.map((r) => ({ size: r.size, price: r.price, on: r.on }))
      );
      setNewProducts((prev) => prev.filter((d) => d.localId !== draft.localId));
      await reload();
    } finally {
      setSavingLocalId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-4.5 font-serif text-[26px]">상품 및 정보 수정</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
        <div className="min-w-45 flex-1">
          <div className="text-[14.5px] font-bold">상품등록</div>
          <div className="mt-0.5 text-xs text-text-muted">품종을 추가하고 크기별 가격을 설정하세요.</div>
        </div>
        <button
          type="button"
          onClick={addDraftProduct}
          className="flex items-center gap-1.5 rounded-[11px] bg-green px-4 py-2.5 text-[13.5px] font-bold text-white hover:bg-green-hover"
        >
          <span className="text-[15px]">+</span>상품 추가
        </button>
      </div>

      {products.length === 0 && newProducts.length === 0 ? (
        <p className="mb-7.5 text-sm text-text-muted">
          {loading ? "불러오는 중..." : "등록된 상품이 없습니다. 위에서 상품을 추가해 주세요."}
        </p>
      ) : (
        <div
          className="mb-7.5 grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {products.map((product, pIndex) => (
            <div key={product.id} className="min-w-0 rounded-[18px] border border-line bg-white p-4.5">
              <div className="mb-3.5 flex items-center gap-2.5">
                <input
                  value={product.name}
                  onChange={(e) => updateLocalName(pIndex, e.target.value)}
                  onBlur={(e) => renameProduct(product.id, e.target.value)}
                  placeholder="상품명"
                  className="min-w-0 flex-1 border-0 border-b-[1.5px] border-line bg-transparent py-1 text-[17px] font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="text-xs text-text-muted hover:text-peach"
                >
                  삭제
                </button>
              </div>
              <table className="w-full table-fixed border-collapse text-[13.5px]">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th className="w-[36%] py-2 px-1 font-medium">상품갯수</th>
                    <th className="w-[34%] py-2 px-1 font-medium">가격</th>
                    <th className="w-[30%] py-2 px-1 text-right font-medium">가능여부</th>
                  </tr>
                </thead>
                <tbody>
                  {product.rows.map((row, rIndex) => (
                    <tr key={row.id} className="border-t border-line/70">
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-1">
                          <input
                            value={row.size}
                            onChange={(e) => updateLocalRow(pIndex, rIndex, { size: e.target.value })}
                            onBlur={(e) => updatePriceTier(row.id, { size: e.target.value })}
                            placeholder="12 ~ 13"
                            className="w-full min-w-0 flex-1 rounded-[9px] border border-line px-1.5 py-2 text-[13px]"
                          />
                          <span className="flex-none text-[13px] text-text-soft">과</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-1">
                          <input
                            value={row.price ? row.price.toLocaleString("ko-KR") : ""}
                            onChange={(e) =>
                              updateLocalRow(pIndex, rIndex, { price: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })
                            }
                            onBlur={(e) =>
                              updatePriceTier(row.id, { price: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })
                            }
                            placeholder="40,000"
                            className="w-full min-w-0 flex-1 rounded-[9px] border border-line px-1.5 py-2 text-right text-[13px]"
                          />
                          <span className="flex-none text-[13px] text-text-soft">원</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggle(pIndex, rIndex)}
                          className="relative h-6.5 w-11.5 rounded-full transition-colors"
                          style={{ background: row.on ? "#2F6B4A" : "#D8D2C4" }}
                        >
                          <span
                            className="absolute top-0.75 h-5 w-5 rounded-full bg-white transition-all"
                            style={{ left: row.on ? "22px" : "3px" }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={async () => {
                  await addPriceTier(product.id);
                  reload();
                }}
                className="mt-2.5 w-full rounded-[11px] border-[1.5px] border-dashed border-line py-2 text-sm text-green"
              >
                +
              </button>
            </div>
          ))}

          {newProducts.map((draft) => (
            <div
              key={draft.localId}
              className="min-w-0 rounded-[18px] border-2 border-dashed border-green/50 bg-white p-4.5"
            >
              <div className="mb-3.5 flex items-center gap-2.5">
                <input
                  value={draft.name}
                  onChange={(e) => updateDraftName(draft.localId, e.target.value)}
                  placeholder="상품명"
                  autoFocus
                  className="min-w-0 flex-1 border-0 border-b-[1.5px] border-line bg-transparent py-1 text-[17px] font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => cancelDraft(draft.localId)}
                  className="text-xs text-text-muted hover:text-peach"
                >
                  취소
                </button>
              </div>
              <table className="w-full table-fixed border-collapse text-[13.5px]">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th className="w-[36%] py-2 px-1 font-medium">상품갯수</th>
                    <th className="w-[34%] py-2 px-1 font-medium">가격</th>
                    <th className="w-[30%] py-2 px-1 text-right font-medium">가능여부</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.rows.map((row) => (
                    <tr key={row.localId} className="border-t border-line/70">
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-1">
                          <input
                            value={row.size}
                            onChange={(e) => updateDraftRow(draft.localId, row.localId, { size: e.target.value })}
                            placeholder="12 ~ 13"
                            className="w-full min-w-0 flex-1 rounded-[9px] border border-line px-1.5 py-2 text-[13px]"
                          />
                          <span className="flex-none text-[13px] text-text-soft">과</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-1">
                          <input
                            value={row.price ? row.price.toLocaleString("ko-KR") : ""}
                            onChange={(e) =>
                              updateDraftRow(draft.localId, row.localId, {
                                price: Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
                              })
                            }
                            placeholder="40,000"
                            className="w-full min-w-0 flex-1 rounded-[9px] border border-line px-1.5 py-2 text-right text-[13px]"
                          />
                          <span className="flex-none text-[13px] text-text-soft">원</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1 text-right">
                        <button
                          type="button"
                          onClick={() => updateDraftRow(draft.localId, row.localId, { on: !row.on })}
                          className="relative h-6.5 w-11.5 rounded-full transition-colors"
                          style={{ background: row.on ? "#2F6B4A" : "#D8D2C4" }}
                        >
                          <span
                            className="absolute top-0.75 h-5 w-5 rounded-full bg-white transition-all"
                            style={{ left: row.on ? "22px" : "3px" }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => addDraftRow(draft.localId)}
                className="mt-2.5 w-full rounded-[11px] border-[1.5px] border-dashed border-line py-2 text-sm text-green"
              >
                +
              </button>
              <button
                type="button"
                disabled={savingLocalId === draft.localId}
                onClick={() => saveDraft(draft)}
                className="mt-2.5 w-full rounded-[11px] bg-green py-2.5 text-sm font-bold text-white hover:bg-green-hover disabled:opacity-50"
              >
                {savingLocalId === draft.localId ? "저장 중..." : "저장"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="my-6.5 h-px bg-line" />

      <div className="max-w-130 rounded-[18px] border border-line bg-white p-4.5">
        <div className="mb-1 text-[14.5px] font-bold">계좌 정보</div>
        <p className="mb-4 text-[12.5px] text-text-muted">주문 완료 후 고객에게 보이는 계좌이체 정보입니다.</p>
        <div className="flex flex-col gap-2.5">
          {(
            [
              ["은행", "bankName"],
              ["예금주명", "holder"],
              ["계좌번호", "accountNo"],
              ["연락처", "phone"],
            ] as const
          ).map(([label, key]) => (
            <div key={key}>
              <label className="mb-1 block text-xs text-text-muted">{label}</label>
              <input
                value={acc[key]}
                onChange={(e) => {
                  setAcc((s) => ({ ...s, [key]: e.target.value }));
                  setSaved(false);
                }}
                className="w-full rounded-[11px] border border-line px-3 py-2.5 text-[14.5px]"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={async () => {
            await saveBankAccount(acc);
            setSaved(true);
          }}
          className="mt-4 rounded-[11px] bg-green px-6.5 py-3 text-[14.5px] font-bold text-white hover:bg-green-hover"
        >
          {saved ? "저장됨" : "저장"}
        </button>
      </div>
    </div>
  );
}
