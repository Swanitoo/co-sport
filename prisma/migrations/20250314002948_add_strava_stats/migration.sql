-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stravaCyclingSpeed" DOUBLE PRECISION,
ADD COLUMN     "stravaItraPoints" INTEGER,
ADD COLUMN     "stravaRunningPace" INTEGER,
ADD COLUMN     "stravaStatsUpdatedAt" TIMESTAMP(3);
