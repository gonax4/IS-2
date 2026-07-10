/*
  Warnings:

  - Changed the type of `result` on the `TechnicalClosure` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TechnicalClosure" ADD COLUMN     "closureReasonId" TEXT,
DROP COLUMN "result",
ADD COLUMN     "result" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "TechnicalClosure_closureReasonId_idx" ON "TechnicalClosure"("closureReasonId");

-- AddForeignKey
ALTER TABLE "TechnicalClosure" ADD CONSTRAINT "TechnicalClosure_closureReasonId_fkey" FOREIGN KEY ("closureReasonId") REFERENCES "ClosureReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
