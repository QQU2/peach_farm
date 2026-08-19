# 해암농원 주문 사이트

## 스택
- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL (Vercel Postgres 또는 Supabase)
- Tailwind CSS
- 배포: Vercel

## DB 설계
- Product (품종)
- PriceTier (품종별 크기-가격)
- Order (주문 - 주문자 정보)
- Delivery (배송지 카드, Order 1:N)
- DeliveryItem (배송지별 상품, Delivery 1:N)
- 관리자 로그인은 NextAuth 없이 간단한 세션 기반으로 구현

## 화면
- 메인 → 주문 / 주문확인
- 주문서: 배송지 카드 여러 개, 각 카드에 상품별 수량
- 관리자: 주문목록(기간조회, 입금확인/거절), 상품설정