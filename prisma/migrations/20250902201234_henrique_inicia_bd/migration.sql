-- CreateTable
CREATE TABLE "public"."message" (
    "id" TEXT NOT NULL,
    "signatoryId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "assinature" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_signatoryId_idx" ON "public"."message"("signatoryId");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "public"."Log"("userId");

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_signatoryId_fkey" FOREIGN KEY ("signatoryId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
