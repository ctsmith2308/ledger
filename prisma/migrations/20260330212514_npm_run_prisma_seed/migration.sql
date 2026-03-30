/*
  Warnings:

  - The primary key for the `bank_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `bank_accounts` table. All the data in the column will be lost.
  - The primary key for the `plaid_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `plaid_items` table. All the data in the column will be lost.
  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "banking"."bank_accounts" DROP CONSTRAINT "bank_accounts_plaid_item_id_fkey";

-- DropIndex
DROP INDEX "banking"."bank_accounts_plaid_account_id_key";

-- DropIndex
DROP INDEX "banking"."plaid_items_plaid_item_id_key";

-- DropIndex
DROP INDEX "transactions"."transactions_plaid_transaction_id_key";

-- AlterTable
ALTER TABLE "banking"."bank_accounts" DROP CONSTRAINT "bank_accounts_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("plaid_account_id");

-- AlterTable
ALTER TABLE "banking"."plaid_items" DROP CONSTRAINT "plaid_items_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "plaid_items_pkey" PRIMARY KEY ("plaid_item_id");

-- AlterTable
ALTER TABLE "transactions"."transactions" DROP CONSTRAINT "transactions_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("plaid_transaction_id");

-- AddForeignKey
ALTER TABLE "banking"."bank_accounts" ADD CONSTRAINT "bank_accounts_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "banking"."plaid_items"("plaid_item_id") ON DELETE CASCADE ON UPDATE CASCADE;
