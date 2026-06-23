-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CURATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('CREDENTIALS', 'GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "TravelPace" AS ENUM ('ONE_PLACE_DEEPLY', 'SLOW_UNHURRIED', 'GENTLY_BALANCED');

-- CreateEnum
CREATE TYPE "TransportPreference" AS ENUM ('RAIL_FIRST', 'MIXED', 'ROAD', 'ANY');

-- CreateEnum
CREATE TYPE "BudgetTier" AS ENUM ('MODEST', 'COMFORTABLE', 'PREMIUM', 'LUXURY');

-- CreateEnum
CREATE TYPE "MeasurementSystem" AS ENUM ('METRIC', 'IMPERIAL');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('NONE', 'ONE_TIME', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PER_JOURNEY', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'UNPAID', 'PAUSED');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('GRANT', 'PURCHASE', 'PROMO', 'CONSUMPTION', 'REFUND', 'EXPIRATION', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'REFINING', 'ARCHIVED', 'FAILED');

-- CreateEnum
CREATE TYPE "RefinementType" AS ENUM ('INITIAL', 'PACE_CHANGE', 'ADD_INTEREST', 'REMOVE_STOP', 'ADD_STOP', 'REORDER', 'DATE_CHANGE', 'BUDGET_CHANGE', 'AVOID_CROWDS', 'FREEFORM');

-- CreateEnum
CREATE TYPE "StopKind" AS ENUM ('CITY', 'TOWN', 'VILLAGE', 'NATURE', 'HERITAGE_SITE', 'STAY', 'EXPERIENCE', 'TRANSIT', 'MEAL');

-- CreateEnum
CREATE TYPE "SavedPlaceKind" AS ENUM ('DESTINATION', 'STAY', 'EXPERIENCE', 'RESTAURANT', 'POINT_OF_INTEREST');

-- CreateEnum
CREATE TYPE "RecommendationSource" AS ENUM ('CLAUDE', 'EDITORIAL', 'TRENDING', 'SIMILAR_TRAVELERS');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('SUGGESTED', 'VIEWED', 'SAVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AiGenerationStatus" AS ENUM ('QUEUED', 'STREAMING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AiGenerationKind" AS ENUM ('JOURNEY_PLAN', 'JOURNEY_REFINEMENT', 'DESTINATION_INSIGHT', 'RECOMMENDATION', 'SUMMARY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'JOURNEY_READY', 'JOURNEY_FAILED', 'RECOMMENDATION', 'BILLING', 'CREDIT', 'ONBOARDING', 'MARKETING');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SIGN_UP', 'LOGIN', 'ONBOARDING_STEP', 'ONBOARDING_COMPLETE', 'JOURNEY_CREATED', 'JOURNEY_REFINED', 'JOURNEY_VIEWED', 'PLACE_SAVED', 'JOURNEY_SAVED', 'SUBSCRIPTION_CHANGED', 'CREDIT_SPENT', 'RECOMMENDATION_CLICKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "expiresAt" INTEGER,
    "tokenType" TEXT,
    "scope" TEXT,
    "idToken" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "homeCity" TEXT,
    "homeCountry" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_preferences" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "pace" "TravelPace" NOT NULL DEFAULT 'SLOW_UNHURRIED',
    "transport" "TransportPreference" NOT NULL DEFAULT 'RAIL_FIRST',
    "budget" "BudgetTier" NOT NULL DEFAULT 'COMFORTABLE',
    "units" "MeasurementSystem" NOT NULL DEFAULT 'METRIC',
    "avoidCrowds" BOOLEAN NOT NULL DEFAULT true,
    "regenerativeOnly" BOOLEAN NOT NULL DEFAULT false,
    "localGuides" BOOLEAN NOT NULL DEFAULT true,
    "smallScale" BOOLEAN NOT NULL DEFAULT true,
    "lowWaste" BOOLEAN NOT NULL DEFAULT false,
    "maxTravelHoursPerDay" INTEGER,
    "preferredTripLength" INTEGER,
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_styles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "glyph" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "travel_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "glyph" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_travel_styles" (
    "profileId" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_travel_styles_pkey" PRIMARY KEY ("profileId","styleId")
);

-- CreateTable
CREATE TABLE "profile_interests" (
    "profileId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_interests_pkey" PRIMARY KEY ("profileId","interestId")
);

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interval" "BillingInterval" NOT NULL DEFAULT 'MONTH',
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "priceAmount" INTEGER,
    "priceCurrency" TEXT NOT NULL DEFAULT 'usd',
    "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
    "unlimitedCredits" BOOLEAN NOT NULL DEFAULT false,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lifetimeGranted" INTEGER NOT NULL DEFAULT 0,
    "lifetimeConsumed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "journeyId" TEXT,
    "aiGenerationId" TEXT,
    "externalRef" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journeys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "JourneyStatus" NOT NULL DEFAULT 'DRAFT',
    "originQuery" TEXT,
    "primaryCountry" TEXT,
    "region" TEXT,
    "pace" "TravelPace",
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "durationDays" INTEGER,
    "travelerCount" INTEGER NOT NULL DEFAULT 1,
    "budget" "BudgetTier",
    "heroImageUrl" TEXT,
    "metadata" JSONB,
    "boundingBox" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_stops" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "kind" "StopKind" NOT NULL DEFAULT 'CITY',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nights" INTEGER,
    "dayStart" INTEGER,
    "dayEnd" INTEGER,
    "googlePlaceId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "imageUrl" TEXT,
    "highlights" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journey_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_refinements" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "type" "RefinementType" NOT NULL,
    "instruction" TEXT,
    "params" JSONB,
    "fromVersion" INTEGER,
    "toVersion" INTEGER,
    "aiGenerationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journey_refinements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_places" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "SavedPlaceKind" NOT NULL DEFAULT 'DESTINATION',
    "name" TEXT NOT NULL,
    "note" TEXT,
    "googlePlaceId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "country" TEXT,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_journeys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "RecommendationSource" NOT NULL DEFAULT 'CLAUDE',
    "status" "RecommendationStatus" NOT NULL DEFAULT 'SUGGESTED',
    "title" TEXT NOT NULL,
    "reason" TEXT,
    "region" TEXT,
    "country" TEXT,
    "googlePlaceId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "score" DOUBLE PRECISION,
    "aiGenerationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "destination_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AiGenerationKind" NOT NULL,
    "status" "AiGenerationStatus" NOT NULL DEFAULT 'QUEUED',
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "maxTokens" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "costMicroUsd" INTEGER,
    "latencyMs" INTEGER,
    "output" JSONB,
    "errorMessage" TEXT,
    "journeyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompt_logs" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "toolCalls" JSONB,
    "redactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_prompt_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "platform" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "travel_preferences_profileId_key" ON "travel_preferences"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "travel_styles_slug_key" ON "travel_styles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "interests_slug_key" ON "interests"("slug");

-- CreateIndex
CREATE INDEX "profile_travel_styles_styleId_idx" ON "profile_travel_styles"("styleId");

-- CreateIndex
CREATE INDEX "profile_interests_interestId_idx" ON "profile_interests"("interestId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_stripeProductId_key" ON "membership_plans"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_stripePriceId_key" ON "membership_plans"("stripePriceId");

-- CreateIndex
CREATE INDEX "membership_plans_tier_idx" ON "membership_plans"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_wallets_userId_key" ON "credit_wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_transactions_externalRef_key" ON "credit_transactions"("externalRef");

-- CreateIndex
CREATE INDEX "credit_transactions_walletId_createdAt_idx" ON "credit_transactions"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_transactions_userId_createdAt_idx" ON "credit_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions"("type");

-- CreateIndex
CREATE INDEX "journeys_userId_status_idx" ON "journeys"("userId", "status");

-- CreateIndex
CREATE INDEX "journeys_status_idx" ON "journeys"("status");

-- CreateIndex
CREATE INDEX "journeys_createdAt_idx" ON "journeys"("createdAt");

-- CreateIndex
CREATE INDEX "journey_stops_journeyId_idx" ON "journey_stops"("journeyId");

-- CreateIndex
CREATE INDEX "journey_stops_googlePlaceId_idx" ON "journey_stops"("googlePlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "journey_stops_journeyId_order_key" ON "journey_stops"("journeyId", "order");

-- CreateIndex
CREATE INDEX "journey_refinements_journeyId_createdAt_idx" ON "journey_refinements"("journeyId", "createdAt");

-- CreateIndex
CREATE INDEX "saved_places_userId_createdAt_idx" ON "saved_places"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_places_userId_googlePlaceId_key" ON "saved_places"("userId", "googlePlaceId");

-- CreateIndex
CREATE INDEX "saved_journeys_userId_createdAt_idx" ON "saved_journeys"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_journeys_userId_journeyId_key" ON "saved_journeys"("userId", "journeyId");

-- CreateIndex
CREATE INDEX "destination_recommendations_userId_status_idx" ON "destination_recommendations"("userId", "status");

-- CreateIndex
CREATE INDEX "destination_recommendations_userId_score_idx" ON "destination_recommendations"("userId", "score");

-- CreateIndex
CREATE INDEX "ai_generations_userId_createdAt_idx" ON "ai_generations"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_generations_kind_status_idx" ON "ai_generations"("kind", "status");

-- CreateIndex
CREATE INDEX "ai_prompt_logs_generationId_sequence_idx" ON "ai_prompt_logs"("generationId", "sequence");

-- CreateIndex
CREATE INDEX "ai_prompt_logs_userId_createdAt_idx" ON "ai_prompt_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_userId_createdAt_idx" ON "user_activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_type_createdAt_idx" ON "user_activities"("type", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_preferences" ADD CONSTRAINT "travel_preferences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_travel_styles" ADD CONSTRAINT "profile_travel_styles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_travel_styles" ADD CONSTRAINT "profile_travel_styles_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "travel_styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_wallets" ADD CONSTRAINT "credit_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "credit_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_stops" ADD CONSTRAINT "journey_stops_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_refinements" ADD CONSTRAINT "journey_refinements_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_refinements" ADD CONSTRAINT "journey_refinements_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_places" ADD CONSTRAINT "saved_places_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_journeys" ADD CONSTRAINT "saved_journeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_journeys" ADD CONSTRAINT "saved_journeys_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_recommendations" ADD CONSTRAINT "destination_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_recommendations" ADD CONSTRAINT "destination_recommendations_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_prompt_logs" ADD CONSTRAINT "ai_prompt_logs_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "ai_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_prompt_logs" ADD CONSTRAINT "ai_prompt_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
