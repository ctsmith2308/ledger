'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { type TransactionDTO } from '@/core/modules/transactions';

import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/app/_components';

const PAGE_SIZE = 25;

const columns: ColumnDef<TransactionDTO>[] = [
  {
    accessorKey: 'merchantName',
    header: 'Merchant',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.merchantName ?? row.original.name}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <span
        className="inline-flex cursor-pointer items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date
        <ArrowUpDown className="size-3" />
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.date.split('T')[0]}
      </span>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.category ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <span
        className="inline-flex cursor-pointer items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Amount
        <ArrowUpDown className="size-3" />
      </span>
    ),
    meta: { align: 'right' },
    cell: ({ row }) => {
      const amount = row.original.amount;
      const isExpense = amount > 0;

      return (
        <span
          className={`font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}
        >
          {isExpense ? '-' : '+'}${Math.abs(amount).toFixed(2)}
        </span>
      );
    },
  },
];

function TransactionList({
  transactions,
  paginate = true,
}: {
  transactions: TransactionDTO[];
  paginate?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(paginate ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: {
      pagination: { pageSize: PAGE_SIZE },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align =
                  (header.column.columnDef.meta as { align?: string })
                    ?.align === 'right'
                    ? 'text-right'
                    : '';

                return (
                  <TableHead key={header.id} className={align}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const align =
                    (cell.column.columnDef.meta as { align?: string })
                      ?.align === 'right'
                      ? 'text-right'
                      : '';

                  return (
                    <TableCell key={cell.id} className={align}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {paginate && pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {pageCount}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { TransactionList };
