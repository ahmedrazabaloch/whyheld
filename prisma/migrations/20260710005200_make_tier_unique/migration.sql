-- DropIndex
DROP INDEX IF EXISTS "membership_plans_tier_idx";

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_tier_key" ON "membership_plans"("tier");
