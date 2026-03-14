-- CreateEnum
CREATE TYPE "Placement" AS ENUM ('NONE', 'LATEST_COLLECTIONS', 'FEATURED_DEAL');

-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "placement" "Placement" NOT NULL DEFAULT 'NONE',
ADD COLUMN "placementExpiresAt" TIMESTAMP(3);
