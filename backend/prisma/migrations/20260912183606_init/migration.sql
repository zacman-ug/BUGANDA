-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'contributor', 'viewer', 'moderator');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "role" "Role" NOT NULL DEFAULT 'viewer',
    "reset_code" VARCHAR(10),
    "reset_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clan" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Individual" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "gender" "Gender" NOT NULL,
    "clan_id" INTEGER,
    "father_id" INTEGER,
    "mother_id" INTEGER,
    "spouse_id" INTEGER,
    "bio" TEXT,
    "date_of_birth" DATE,
    "date_of_death" DATE,
    "occupation" VARCHAR(255),
    "residence" VARCHAR(255),
    "alternative_name" VARCHAR(255),
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Individual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marriage" (
    "id" SERIAL NOT NULL,
    "husband_id" INTEGER,
    "wife_id" INTEGER,
    "marriage_date" DATE,
    "notes" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Marriage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clan_name_key" ON "Clan"("name");

-- CreateIndex
CREATE INDEX "Individual_user_id_idx" ON "Individual"("user_id");

-- CreateIndex
CREATE INDEX "Individual_father_id_idx" ON "Individual"("father_id");

-- CreateIndex
CREATE INDEX "Individual_mother_id_idx" ON "Individual"("mother_id");

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_spouse_id_fkey" FOREIGN KEY ("spouse_id") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_husband_id_fkey" FOREIGN KEY ("husband_id") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_wife_id_fkey" FOREIGN KEY ("wife_id") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
