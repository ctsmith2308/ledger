const parsePeriod = (period: string): Date => {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1);
};

const formatPeriod = (period: string): string => {
  const date = parsePeriod(period);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export { parsePeriod, formatPeriod };
