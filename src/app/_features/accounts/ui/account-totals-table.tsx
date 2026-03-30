import { type AccountTypeTotal } from '@/app/_entities/banking/lib';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/app/_components';

function AccountTotalsTable({
  totals,
  limit,
}: {
  totals: AccountTypeTotal[];
  limit?: number;
}) {
  const rows = limit ? totals.slice(0, limit) : totals;

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>

            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.type}>
              <TableCell className="font-medium text-foreground">
                {row.type}
              </TableCell>

              <TableCell
                className={`text-right font-semibold ${row.isLiability ? 'text-red-600' : 'text-green-600'}`}
              >
                ${row.total.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { AccountTotalsTable };
