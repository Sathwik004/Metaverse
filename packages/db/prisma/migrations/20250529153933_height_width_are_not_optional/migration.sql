/*
  Warnings:

  - Made the column `height` on table `Space` required. This step will fail if there are existing NULL values in that column.
  - Made the column `x` on table `mapElements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `y` on table `mapElements` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "height" SET NOT NULL;

-- AlterTable
ALTER TABLE "mapElements" ALTER COLUMN "x" SET NOT NULL,
ALTER COLUMN "y" SET NOT NULL;
