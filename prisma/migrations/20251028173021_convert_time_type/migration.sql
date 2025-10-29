/*
  Warnings:

  - You are about to drop the column `cratedAt` on the `Score` table. All the data in the column will be lost.
  - Changed the type of `time` on the `Score` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Score" DROP COLUMN "cratedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "time",
ADD COLUMN     "time" DOUBLE PRECISION NOT NULL;
