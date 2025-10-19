/*
  Warnings:

  - Made the column `imgUrl` on table `Character` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Character" ALTER COLUMN "imgUrl" SET NOT NULL;
