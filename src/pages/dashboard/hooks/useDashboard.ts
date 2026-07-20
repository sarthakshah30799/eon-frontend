import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard/dashboard.api';
import type { RecentTransaction } from '@/api/dashboard/dashboard.api';
import { currencyRatesApi } from '@/api/currencyRates';

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

export type Trend = 'up' | 'down';

export interface TrendInfo {
  trend: Trend;
  label: string;
}

export const useDashboard = () => {
  const navigate = useNavigate();
  const [chartDays, setChartDays] = useState(7);

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 60000,
  });

  const volByCurrencyQuery = useQuery({
    queryKey: ['dashboard', 'vol-by-currency'],
    queryFn: () => dashboardApi.getVolumeByCurrency(),
    refetchInterval: 60000,
  });

  const chartQuery = useQuery({
    queryKey: ['dashboard', 'volume-chart', chartDays],
    queryFn: () => dashboardApi.getVolumeChart(chartDays),
  });

  const recentTxnsQuery = useQuery({
    queryKey: ['dashboard', 'recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(10),
    refetchInterval: 30000,
  });

  const pendingApprovalsQuery = useQuery({
    queryKey: ['dashboard', 'pending-approvals'],
    queryFn: () => dashboardApi.getPendingApprovals(10),
    refetchInterval: 30000,
  });

  const latestRatesQuery = useQuery({
    queryKey: ['currency-rates', 'latest'],
    queryFn: () => currencyRatesApi.getLatestRates(),
    refetchInterval: 60000,
  });

  const chartVolume = useMemo(() => {
    return (chartQuery.data ?? []).map((d) => ({
      ...d,
      saleVolume: parseFloat(d.saleVolume),
      purchaseVolume: parseFloat(d.purchaseVolume),
    }));
  }, [chartQuery.data]);

  const volumeTrend = useMemo((): TrendInfo => {
    const stats = statsQuery.data;
    if (!stats) return { trend: 'up', label: '' };
    const t = parseFloat(stats.todayVolume);
    const y = parseFloat(stats.yesterdayVolume);
    if (y === 0) return { trend: 'up', label: 'vs yesterday' };
    const pct = ((t - y) / y * 100).toFixed(1);
    return {
      trend: t >= y ? 'up' : 'down',
      label: `${pct}% vs yesterday`,
    };
  }, [statsQuery.data]);

  const txnTrend = useMemo((): TrendInfo => {
    const stats = statsQuery.data;
    if (!stats) return { trend: 'up', label: '' };
    const diff = stats.todayTransactionCount - stats.yesterdayTransactionCount;
    return {
      trend: diff >= 0 ? 'up' : 'down',
      label: `${Math.abs(diff)} ${diff >= 0 ? 'more' : 'fewer'} than yesterday`,
    };
  }, [statsQuery.data]);

  const handleTxnClick = useCallback((txn: RecentTransaction) => {
    navigate(`/transactions/${txn.id}`);
  }, [navigate]);

  const handlePartyProfileClick = useCallback((id: string, type: string) => {
    navigate(`/party-profiles/${type.toLowerCase()}/edit/${id}`);
  }, [navigate]);

  const refreshChart = useCallback(() => {
    setChartDays((d) => d);
  }, []);

  return {
    stats: statsQuery.data,
    volByCurrency: volByCurrencyQuery.data ?? [],
    chartVolume,
    chartLoading: chartQuery.isLoading,
    recentTxns: recentTxnsQuery.data ?? [],
    recentLoading: recentTxnsQuery.isLoading,
    pendingApprovals: pendingApprovalsQuery.data ?? [],
    pendingLoading: pendingApprovalsQuery.isLoading,
    latestRates: latestRatesQuery.data ?? [],
    chartDays,
    setChartDays,
    refreshChart,
    volumeTrend,
    txnTrend,
    handleTxnClick,
    handlePartyProfileClick,
  };
};
