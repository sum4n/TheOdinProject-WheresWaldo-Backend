-- CreateTable
CREATE TABLE "public"."Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "xLeft" INTEGER NOT NULL,
    "xRight" INTEGER NOT NULL,
    "yTop" INTEGER NOT NULL,
    "yBottom" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "public"."Character"("name");
