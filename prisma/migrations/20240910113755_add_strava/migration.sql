-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stravaLinked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "stravaAthleteId" SET DATA TYPE TEXT;
