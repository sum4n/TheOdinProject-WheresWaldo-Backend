/*
  Warnings:

  - A unique constraint covering the columns `[imgUrl]` on the table `Character` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Character" ADD COLUMN     "gameboardId" INTEGER,
ADD COLUMN     "imgUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."Gameboard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,

    CONSTRAINT "Gameboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gameboard_name_key" ON "public"."Gameboard"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Gameboard_imgUrl_key" ON "public"."Gameboard"("imgUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Character_imgUrl_key" ON "public"."Character"("imgUrl");

-- AddForeignKey
ALTER TABLE "public"."Character" ADD CONSTRAINT "Character_gameboardId_fkey" FOREIGN KEY ("gameboardId") REFERENCES "public"."Gameboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
