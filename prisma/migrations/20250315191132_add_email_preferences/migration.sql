-- CreateTable
CREATE TABLE "EmailPreference" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
    "newMessagesEmails" BOOLEAN NOT NULL DEFAULT true,
    "joinRequestEmails" BOOLEAN NOT NULL DEFAULT true,
    "membershipEmails" BOOLEAN NOT NULL DEFAULT true,
    "reviewEmails" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailPreference_userId_key" ON "EmailPreference"("userId");

-- CreateIndex
CREATE INDEX "EmailPreference_userId_idx" ON "EmailPreference"("userId");

-- AddForeignKey
ALTER TABLE "EmailPreference" ADD CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
