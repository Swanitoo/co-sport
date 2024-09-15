/*
  Warnings:

  - You are about to drop the column `badge_type_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `follower` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `friend` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `premium` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profile` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profile_medium` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resource_state` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `summit` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "badge_type_id",
DROP COLUMN "bio",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "firstname",
DROP COLUMN "follower",
DROP COLUMN "friend",
DROP COLUMN "lastname",
DROP COLUMN "premium",
DROP COLUMN "profile",
DROP COLUMN "profile_medium",
DROP COLUMN "resource_state",
DROP COLUMN "sex",
DROP COLUMN "state",
DROP COLUMN "summit",
DROP COLUMN "username",
DROP COLUMN "weight";
