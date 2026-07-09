-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationPlaceId" TEXT,
ADD COLUMN     "locationUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE INDEX "destination_recommendations_userId_status_score_idx" ON "destination_recommendations"("userId", "status", "score");

-- CreateIndex
CREATE INDEX "journeys_userId_status_updatedAt_idx" ON "journeys"("userId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "profiles_countryCode_idx" ON "profiles"("countryCode");
