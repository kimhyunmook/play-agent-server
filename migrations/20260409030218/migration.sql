-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('활성', '비활성', '정지', '차단');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('유저', '관리자');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('이메일', 'Google');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(20),
    "profile" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT '유저',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT '활성',
    "login_id" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "provider" "AuthProvider" NOT NULL DEFAULT '이메일',
    "provider_id" VARCHAR(255),
    "last_login_at" TIMESTAMPTZ(3),

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_name" ON "user"("name");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_deleted_at" ON "user"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_user_id_key" ON "user_account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_login_id_key" ON "user_account"("login_id");

-- CreateIndex
CREATE INDEX "idx_user_login_id" ON "user_account"("login_id");

-- CreateIndex
CREATE INDEX "idx_user_account_user_id" ON "user_account"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_account_status" ON "user_account"("status");

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
