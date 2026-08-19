import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "../actions";
import SidebarNav from "./sidebar-nav";

export const metadata: Metadata = {
  title: "해암농원 | 관리자",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-wrap bg-cream-soft">
      <aside className="min-w-45 max-w-57.5 flex-[1_1_200px] bg-green px-4.5 py-6 text-cream">
        <div className="mb-4 font-serif text-[22px] leading-normal">
          해암농원
          <strong> 농장관리</strong>
        </div>
        <hr className="mb-6"/>
        <SidebarNav />
        <div className="mt-7 flex flex-col items-start gap-2">
          <Link
            href="/"
            className="rounded-full border border-cream/25 px-3.5 py-2 text-xs text-cream/75 hover:bg-cream/10"
          >
            고객 화면 보기
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-cream/25 px-3.5 py-2 text-xs text-cream/75 hover:bg-cream/10"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-[1_1_560px] px-4 py-6.5 pb-15 sm:px-8">{children}</main>
    </div>
  );
}
