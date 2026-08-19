"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "주문목록" },
  { href: "/admin/products", label: "상품설정" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-[11px] px-3.5 py-2.5 text-sm ${
              active ? "bg-peach text-white" : "bg-cream/10 text-cream/80 hover:bg-cream/15"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
