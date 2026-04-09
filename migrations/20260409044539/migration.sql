-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_agent_name" ON "agent"("name");

-- CreateIndex
CREATE INDEX "idx_agent_deleted_at" ON "agent"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_agent_user_id" ON "agent"("user_id");

-- AddForeignKey
ALTER TABLE "agent" ADD CONSTRAINT "agent_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
