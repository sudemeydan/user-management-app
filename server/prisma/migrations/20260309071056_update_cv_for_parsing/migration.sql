-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EntryCategory" AS ENUM ('CONTACT_INFO', 'EXPERIENCE', 'EDUCATION', 'SKILL', 'PROJECT', 'LANGUAGE', 'CERTIFICATE', 'OTHER');

-- AlterTable
ALTER TABLE "CV" ADD COLUMN     "rawText" TEXT,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "CVEntry" (
    "id" SERIAL NOT NULL,
    "cvId" INTEGER NOT NULL,
    "category" "EntryCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CVEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CVEntry" ADD CONSTRAINT "CVEntry_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
