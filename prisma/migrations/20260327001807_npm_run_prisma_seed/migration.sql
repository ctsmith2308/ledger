-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "banking";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "budgets";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "transactions";

-- CreateTable
CREATE TABLE "banking"."plaid_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plaid_item_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "institution_id" TEXT,
    "cursor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plaid_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking"."bank_accounts" (
    "id" TEXT NOT NULL,
    "plaid_item_id" TEXT NOT NULL,
    "plaid_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "official_name" TEXT,
    "mask" TEXT,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "available_balance" DECIMAL(12,2),
    "current_balance" DECIMAL(12,2),
    "currency_code" TEXT DEFAULT 'USD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions"."transactions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plaid_transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "merchant_name" TEXT,
    "category" TEXT,
    "detailed_category" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "payment_channel" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets"."budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "monthly_limit" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plaid_items_plaid_item_id_key" ON "banking"."plaid_items"("plaid_item_id");

-- CreateIndex
CREATE INDEX "plaid_items_user_id_idx" ON "banking"."plaid_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_plaid_account_id_key" ON "banking"."bank_accounts"("plaid_account_id");

-- CreateIndex
CREATE INDEX "bank_accounts_plaid_item_id_idx" ON "banking"."bank_accounts"("plaid_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_plaid_transaction_id_key" ON "transactions"."transactions"("plaid_transaction_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"."transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"."transactions"("account_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_category_idx" ON "transactions"."transactions"("user_id", "category");

-- CreateIndex
CREATE INDEX "budgets_user_id_idx" ON "budgets"."budgets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_category_key" ON "budgets"."budgets"("user_id", "category");

-- AddForeignKey
ALTER TABLE "banking"."bank_accounts" ADD CONSTRAINT "bank_accounts_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "banking"."plaid_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
