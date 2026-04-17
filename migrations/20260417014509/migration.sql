/*
  Warnings:

  - Added the required column `role` to the `agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agent" ADD COLUMN     "role" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "agent_role" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),
    "owner_id" INTEGER,

    CONSTRAINT "agent_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_role_name" ON "agent_role"("name");

-- CreateIndex
CREATE INDEX "idx_role_deleted_at" ON "agent_role"("deleted_at");

-- AddForeignKey
ALTER TABLE "agent_role" ADD CONSTRAINT "agent_role_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
