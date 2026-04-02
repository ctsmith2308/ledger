'use client';

import { Doughnut } from 'react-chartjs-2';

import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

import { type CategorySpending } from '@/app/_entities/transactions/lib';

import { formatCategory } from '@/app/_shared/lib/formatters/format-category';

ChartJS.register(ArcElement, Tooltip);

const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

function SpendingDoughnut({ data }: { data: CategorySpending[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  const chartData = {
    labels: data.map((d) => formatCategory(d.category)),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: COLORS.slice(0, data.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            `${ctx.label}: $${ctx.parsed.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      {data.length > 0 ? (
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold text-foreground sm:hidden">
              ${total.toFixed(2)}
            </span>

            <div className="relative aspect-square w-full max-w-40 p-3 sm:max-w-none sm:p-5">
              <Doughnut data={chartData} options={options} />

              <div className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
                <span className="text-lg font-semibold text-foreground">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {data.map((d, i) => (
              <div key={d.category} className="flex items-center gap-2">
                <div
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />

                <span className="truncate text-xs text-muted-foreground">
                  {formatCategory(d.category)}
                </span>

                <span className="ml-auto text-xs font-medium text-foreground">
                  ${d.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-muted-foreground">
            No data reported for this month
          </span>
        </div>
      )}
    </div>
  );
}

export { SpendingDoughnut };
