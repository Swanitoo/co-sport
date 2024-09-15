-- AlterTable
ALTER TABLE "User" ADD COLUMN     "follower" TEXT,
ADD COLUMN     "friend" TEXT,
ADD COLUMN     "premium" BOOLEAN,
ADD COLUMN     "profile" TEXT,
ADD COLUMN     "profile_medium" TEXT,
ADD COLUMN     "summit" TEXT;
