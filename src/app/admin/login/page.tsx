import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "해암농원 | 관리자",
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : "/admin";

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-10">
      <Image
        src="/hero-orchard1.png"
        alt=""
        fill
        priority
        className="object-cover"
        style={{ objectPosition: "center 55%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,25,17,.78), rgba(14,25,17,.88))",
        }}
      />

      <div className="relative w-full max-w-95 text-center">
        <h1 className="my-2.5 mb-6 font-serif text-2xl font-normal text-cream">
          🍑 해암농원 <strong className="font-bold">농장관리</strong> 🍑
        </h1>
        <LoginForm from={from} />
      </div>
    </main>
  );
}
