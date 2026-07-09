-- CreateEnum
CREATE TYPE "TechnicalClosureResult" AS ENUM ('RESOLVED_ON_SITE', 'TEMPORARY_MITIGATION', 'NO_INCIDENT_FOUND', 'DUPLICATE', 'OUT_OF_SCOPE', 'FOLLOW_UP_REQUIRED');

-- CreateTable
CREATE TABLE "TechnicalClosure" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "result" "TechnicalClosureResult" NOT NULL,
    "observations" TEXT NOT NULL,
    "closureEvidenceUrl" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalClosure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalClosure_reportId_key" ON "TechnicalClosure"("reportId");

-- CreateIndex
CREATE INDEX "TechnicalClosure_technicianId_idx" ON "TechnicalClosure"("technicianId");

-- AddForeignKey
ALTER TABLE "TechnicalClosure" ADD CONSTRAINT "TechnicalClosure_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalClosure" ADD CONSTRAINT "TechnicalClosure_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
