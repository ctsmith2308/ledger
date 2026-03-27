-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "transactions_read";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "events";

-- CreateTable
CREATE TABLE "transactions_read"."category_rollups" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "transaction_count" INTEGER NOT NULL,

    CONSTRAINT "category_rollups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events"."domain_events" (
    "id" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_rollups_user_id_category_period_key" ON "transactions_read"."category_rollups"("user_id", "category", "period");

-- CreateIndex
CREATE INDEX "category_rollups_user_id_period_idx" ON "transactions_read"."category_rollups"("user_id", "period");

-- CreateIndex
CREATE INDEX "domain_events_event_type_status_idx" ON "events"."domain_events"("event_type", "status");

-- CreateIndex
CREATE INDEX "domain_events_aggregate_id_idx" ON "events"."domain_events"("aggregate_id");

-- CreateIndex
CREATE INDEX "domain_events_created_at_idx" ON "events"."domain_events"("created_at");
