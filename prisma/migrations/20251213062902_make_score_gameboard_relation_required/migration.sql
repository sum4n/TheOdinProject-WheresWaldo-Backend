/*
  Warnings:

  - Made the column `gameboardId` on table `Score` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Score" DROP CONSTRAINT "Score_gameboardId_fkey";

-- AlterTable
ALTER TABLE "public"."Score" ALTER COLUMN "gameboardId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_gameboardId_fkey" FOREIGN KEY ("gameboardId") REFERENCES "public"."Gameboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
