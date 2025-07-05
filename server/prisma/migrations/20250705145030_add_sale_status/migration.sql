-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('NON_COMMIT', 'IN_PROGRESS', 'SERVED');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "status" "SaleStatus" NOT NULL DEFAULT 'NON_COMMIT';
