import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-14 text-center">
      <Image
        src="/hero-orchard1.png"
        alt="해암농원 과수원 전경"
        fill
        priority
        className="object-cover"
        style={{ objectPosition: "center 58%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,28,19,.5) 0%, rgba(16,28,19,.3) 40%, rgba(16,28,19,.7) 100%)",
        }}
      />

      <div className="relative w-full max-w-140 text-cream">
        <h1 className="my-3.5 font-serif text-[clamp(34px,9vw,48px)] font-bold leading-[1.18] [text-shadow:0_2px_24px_rgba(12,22,15,.5)]">
          어서오세요
          <br />
          🍑 해암농원입니다 🍑
        </h1>
        <div className="mx-auto flex max-w-105 flex-col gap-3">
          <Link
            href="/order"
            className="flex h-14.5 items-center justify-center rounded-full bg-peach text-[17px] font-bold tracking-[0.02em] text-white shadow-[0_16px_34px_-16px_rgba(12,22,15,.8)] transition-colors hover:bg-peach-hover"
          >
            주문
          </Link>
          <Link
            href="/check"
            className="flex h-14.5 items-center justify-center rounded-full border-[1.5px] border-cream/60 bg-cream/15 text-base font-medium text-cream backdrop-blur-sm transition-colors hover:bg-cream/25"
          >
            주문확인
          </Link>
        </div>
      </div>
    </main>
  );
}
