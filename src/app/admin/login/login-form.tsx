"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm({ from }: { from: string }) {
  const [error, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      <input type="hidden" name="from" value={from} />
      <input
        id="password"
        name="password"
        type="password"
        placeholder="비밀번호"
        required
        autoFocus
        className="w-full rounded-2xl border border-cream/25 bg-cream/[0.07] px-4 py-3.75 text-[15px] text-cream placeholder:text-cream/50 focus:outline-none focus:ring-2 focus:ring-peach"
      />
      {error && <p className="text-sm text-peach">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1.5 h-13.5 rounded-2xl bg-peach text-base font-bold text-white transition-colors hover:bg-peach-hover disabled:opacity-50"
      >
        {isPending ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
