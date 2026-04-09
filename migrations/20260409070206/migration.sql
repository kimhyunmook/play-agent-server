/*
  Warnings:

  - Added the required column `task` to the `agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agent" ADD COLUMN     "task" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "updated_at" DROP NOT NULL;
