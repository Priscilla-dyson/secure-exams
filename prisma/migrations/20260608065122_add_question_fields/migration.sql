-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "contentFormat" TEXT NOT NULL DEFAULT 'PLAIN',
ADD COLUMN     "mathInput" TEXT,
ADD COLUMN     "partLabel" TEXT,
ADD COLUMN     "useMathRendering" BOOLEAN NOT NULL DEFAULT false;
