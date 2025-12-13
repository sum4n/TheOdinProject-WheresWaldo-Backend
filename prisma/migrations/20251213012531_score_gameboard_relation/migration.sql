-- AlterTable
ALTER TABLE "public"."Score" ADD COLUMN     "gameboardId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_gameboardId_fkey" FOREIGN KEY ("gameboardId") REFERENCES "public"."Gameboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
