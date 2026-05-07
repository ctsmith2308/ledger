import { NextRequest, NextResponse } from 'next/server';

import { bankingService } from '@/core/modules/banking';
import { transactionsService } from '@/core/modules/transactions';
import { logger } from '@/core/shared/infrastructure';

type PlaidWebhookBody = {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: {
    error_type: string;
    error_code: string;
    error_message: string;
  };
};

async function POST(request: NextRequest) {
  const body = (await request.json()) as PlaidWebhookBody;
  const { webhook_type, webhook_code, item_id } = body;

  logger.info(`Plaid webhook: ${webhook_type}.${webhook_code} [${item_id}]`);

  if (webhook_type === 'TRANSACTIONS' && webhook_code === 'DEFAULT_UPDATE') {
    return handleTransactionUpdate(item_id);
  }

  if (webhook_type === 'ITEM' && webhook_code === 'ERROR') {
    return handleItemError(item_id, body.error);
  }

  return NextResponse.json({ status: 'ignored' });
}

const handleTransactionUpdate = async (
  itemId: string,
): Promise<NextResponse> => {
  try {
    const userId = await bankingService.getItemOwner(itemId);

    await transactionsService.syncTransactions(userId);

    logger.info(`Webhook-triggered sync complete: ${itemId}`);

    return NextResponse.json({ status: 'synced' });
  } catch (_error) {
    logger.error(`Webhook-triggered sync failed: ${itemId}`);

    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
};

const handleItemError = async (
  itemId: string,
  error: PlaidWebhookBody['error'],
): Promise<NextResponse> => {
  logger.warn(
    `Plaid item error: ${itemId} — ${error?.error_code ?? 'unknown'}`,
  );

  return NextResponse.json({ status: 'acknowledged' });
};

export { POST };
