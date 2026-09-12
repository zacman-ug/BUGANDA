-- Remap any legacy "Other" values before narrowing the enum
UPDATE "Individual" SET "gender" = 'Male' WHERE "gender"::text = 'Other';

ALTER TYPE "Gender" RENAME TO "Gender_old";
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');
ALTER TABLE "Individual" ALTER COLUMN "gender" TYPE "Gender" USING ("gender"::text::"Gender");
DROP TYPE "Gender_old";
