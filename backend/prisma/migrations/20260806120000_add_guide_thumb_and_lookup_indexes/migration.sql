-- MySQL/MariaDB.
--
-- `IF NOT EXISTS` is used throughout because the production database predates
-- Prisma Migrate (it has no `_prisma_migrations` table — it was built with
-- `prisma db push`), so this may be applied to a database that is already
-- partially in the target state. It is safe to re-run.

-- Small WebP derivative for the guide step strip. Nullable so existing rows stay
-- valid; consumers fall back to `imageUrl` until the backfill script populates it.
-- AlterTable
ALTER TABLE `GuideImage` ADD COLUMN IF NOT EXISTS `thumbUrl` TEXT NULL;

-- Lookup indexes.
--
-- NOTE: unlike PostgreSQL, MySQL/MariaDB creates an index for every foreign key
-- automatically, so all the *_fkey columns (Module.courseId, Lesson.moduleId,
-- Quiz.courseId, Result.quizId, Certificate.userId, Enrollment.courseId, …) are
-- already indexed. Only non-foreign-key columns that are filtered or sorted on
-- need declaring here.

-- User.role: filtered by the public stats endpoint (count of STUDENT users).
-- CreateIndex
CREATE INDEX IF NOT EXISTS `User_role_idx` ON `User`(`role`);

-- Course.siteNumber: every non-admin course listing filters on it.
-- CreateIndex
CREATE INDEX IF NOT EXISTS `Course_siteNumber_idx` ON `Course`(`siteNumber`);

-- Course.createdAt: the default ordering for all course listings.
-- CreateIndex
CREATE INDEX IF NOT EXISTS `Course_createdAt_idx` ON `Course`(`createdAt`);
