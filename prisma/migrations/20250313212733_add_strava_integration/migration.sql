/*
  Warnings:

  - You are about to drop the column `activity` on the `StravaActivity` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `StravaActivity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stravaId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityType` to the `StravaActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elapsedTime` to the `StravaActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movingTime` to the `StravaActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `StravaActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `StravaActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateLocal` to the `StravaActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StravaActivity" DROP COLUMN "activity",
DROP COLUMN "date",
ADD COLUMN     "achievementCount" INTEGER,
ADD COLUMN     "activityType" TEXT NOT NULL,
ADD COLUMN     "athleteCount" INTEGER,
ADD COLUMN     "averageCadence" DOUBLE PRECISION,
ADD COLUMN     "averageHeartrate" DOUBLE PRECISION,
ADD COLUMN     "averageRunCadence" DOUBLE PRECISION,
ADD COLUMN     "averageSpeed" DOUBLE PRECISION,
ADD COLUMN     "averageSwimCadence" DOUBLE PRECISION,
ADD COLUMN     "averageWatts" DOUBLE PRECISION,
ADD COLUMN     "commentCount" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "deviceWatts" BOOLEAN,
ADD COLUMN     "elapsedTime" INTEGER NOT NULL,
ADD COLUMN     "kilojoules" DOUBLE PRECISION,
ADD COLUMN     "kudosCount" INTEGER,
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "locationCountry" TEXT,
ADD COLUMN     "locationState" TEXT,
ADD COLUMN     "mapId" TEXT,
ADD COLUMN     "mapPolyline" TEXT,
ADD COLUMN     "maxHeartrate" INTEGER,
ADD COLUMN     "maxSpeed" DOUBLE PRECISION,
ADD COLUMN     "maxWatts" INTEGER,
ADD COLUMN     "movingTime" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "photoCount" INTEGER,
ADD COLUMN     "poolLength" INTEGER,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDateLocal" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sufferScore" INTEGER,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "totalElevationGain" DOUBLE PRECISION,
ADD COLUMN     "totalStrokes" INTEGER,
ADD COLUMN     "weightedAverageWatts" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stravaConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stravaCreatedAt" TIMESTAMP(3),
ADD COLUMN     "stravaFTP" INTEGER,
ADD COLUMN     "stravaFollowerCount" INTEGER,
ADD COLUMN     "stravaFollowingCount" INTEGER,
ADD COLUMN     "stravaId" TEXT,
ADD COLUMN     "stravaLinkRefused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stravaPremium" BOOLEAN,
ADD COLUMN     "stravaRefreshToken" TEXT,
ADD COLUMN     "stravaToken" TEXT,
ADD COLUMN     "stravaTokenExpiresAt" INTEGER,
ADD COLUMN     "stravaWeight" DOUBLE PRECISION,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "StravaSegment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "averageGrade" DOUBLE PRECISION NOT NULL,
    "maximumGrade" DOUBLE PRECISION NOT NULL,
    "elevationHigh" DOUBLE PRECISION NOT NULL,
    "elevationLow" DOUBLE PRECISION NOT NULL,
    "totalElevationGain" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "climbCategory" INTEGER,
    "effortCount" INTEGER,
    "athleteCount" INTEGER,
    "starCount" INTEGER,
    "mapPolyline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StravaSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stravaId_key" ON "User"("stravaId");

-- AddForeignKey
ALTER TABLE "StravaSegment" ADD CONSTRAINT "StravaSegment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
