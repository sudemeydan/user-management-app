-- AlterTable
ALTER TABLE "CV" ADD COLUMN     "atsFormatFeedback" TEXT,
ADD COLUMN     "atsFormatScore" INTEGER;

-- CreateTable
CREATE TABLE "AtsFormattedCV" (
    "id" SERIAL NOT NULL,
    "cvId" INTEGER NOT NULL,
    "fileId" TEXT,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtsFormattedCV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "extractedSkills" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TailoredCV" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobPostingId" INTEGER NOT NULL,
    "originalCvId" INTEGER NOT NULL,
    "atsScore" INTEGER,
    "improvedSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TailoredCV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TailoredCVEntry" (
    "id" SERIAL NOT NULL,
    "tailoredCvId" INTEGER NOT NULL,
    "category" "EntryCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "aiComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TailoredCVEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AtsFormattedCV_cvId_key" ON "AtsFormattedCV"("cvId");

-- AddForeignKey
ALTER TABLE "AtsFormattedCV" ADD CONSTRAINT "AtsFormattedCV_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredCV" ADD CONSTRAINT "TailoredCV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredCV" ADD CONSTRAINT "TailoredCV_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredCV" ADD CONSTRAINT "TailoredCV_originalCvId_fkey" FOREIGN KEY ("originalCvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredCVEntry" ADD CONSTRAINT "TailoredCVEntry_tailoredCvId_fkey" FOREIGN KEY ("tailoredCvId") REFERENCES "TailoredCV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
