-- AlterTable: add as nullable first so existing rows can be backfilled
ALTER TABLE "Delivery" ADD COLUMN     "ordererName" TEXT,
ADD COLUMN     "ordererPhone" TEXT;

-- Backfill existing deliveries from their parent order's orderer info
UPDATE "Delivery" AS d
SET "ordererName" = o."ordererName",
    "ordererPhone" = o."ordererPhone"
FROM "Order" AS o
WHERE o."id" = d."orderId";

-- Now enforce NOT NULL
ALTER TABLE "Delivery" ALTER COLUMN "ordererName" SET NOT NULL,
ALTER COLUMN "ordererPhone" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Delivery_ordererName_ordererPhone_idx" ON "Delivery"("ordererName", "ordererPhone");
