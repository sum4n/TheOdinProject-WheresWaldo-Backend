-- CreateTable
CREATE TABLE "public"."Score" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "cratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);
