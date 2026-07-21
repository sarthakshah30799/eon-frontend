export const formatCurrency = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

export const formatCompact = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (n >= 1_00_00_000) return (n / 1_00_00_000).toFixed(1) + 'Cr';
  if (n >= 1_00_000) return (n / 1_00_000).toFixed(1) + 'L';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
};
