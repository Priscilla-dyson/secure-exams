-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN     "aiProctorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiReviewRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiSuspicionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lookingAwayCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "multiplePersonCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "objectDetectedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionOrder" JSONB;

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "deviceInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginAttempt_attemptId_idx" ON "LoginAttempt"("attemptId");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
