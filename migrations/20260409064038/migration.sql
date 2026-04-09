/*
  Warnings:

  - You are about to drop the column `user_id` on the `agent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_agent_user_id";

-- AlterTable
ALTER TABLE "agent" DROP COLUMN "user_id";

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_department_name" ON "department"("name");

-- CreateIndex
CREATE INDEX "idx_department_deleted_at" ON "department"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_organization_name" ON "organization"("name");

-- CreateIndex
CREATE INDEX "idx_organization_deleted_at" ON "organization"("deleted_at");

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
