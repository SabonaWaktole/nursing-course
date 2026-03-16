/*
  Warnings:

  - The `tags` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `options` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "certificateNumber" TEXT,
ADD COLUMN     "courseTitle" TEXT,
ADD COLUMN     "directorName" TEXT,
ADD COLUMN     "directorTitle" TEXT,
ADD COLUMN     "hoursAttended" INTEGER,
ADD COLUMN     "organizationAddress" TEXT,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "organizationPhone" TEXT,
ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "hours" INTEGER DEFAULT 0,
DROP COLUMN "tags",
ADD COLUMN     "tags" JSONB;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "options",
ADD COLUMN     "options" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "courseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "organizationName" TEXT NOT NULL DEFAULT 'Excelcommunity Living Inc',
    "organizationAddress" TEXT NOT NULL DEFAULT '',
    "organizationPhone" TEXT NOT NULL DEFAULT '',
    "directorName" TEXT NOT NULL DEFAULT 'Administrator',
    "directorTitle" TEXT NOT NULL DEFAULT 'Program Director',
    "providerId" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
