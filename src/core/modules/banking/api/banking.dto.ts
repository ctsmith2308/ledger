type PlaidItemDTO = {
  id: string;
  userId: string;
  institutionId: string | undefined;
  createdAt: string;
};

type BankAccountDTO = {
  id: string;
  plaidItemId: string;
  name: string;
  officialName: string | undefined;
  mask: string | undefined;
  type: string;
  subtype: string | undefined;
  availableBalance: number | undefined;
  currentBalance: number | undefined;
  currencyCode: string;
  createdAt: string;
};

type LinkTokenDTO = {
  linkToken: string;
};

export type { PlaidItemDTO, BankAccountDTO, LinkTokenDTO };
