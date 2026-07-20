import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard/dashboard.api';
import type { VolumeByCurrency, RecentTransaction } from '@/api/dashboard/dashboard.api';
import { currencyRatesApi } from '@/api/currencyRates';
import { Loader } from '@/components/ui/loader';
import { formatDateTime } from '@/utils';
import type { ICurrencyRate } from '@/modules/currencyRates/types/currencyRatesTypes';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const formatCompact = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (n >= 1_00_00_000) return (n / 1_00_00_000).toFixed(1) + 'Cr';
  if (n >= 1_00_000) return (n / 1_00_000).toFixed(1) + 'L';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
};

const VolumeSlider = ({ data }: { data: VolumeByCurrency[] }) => {
  const [idx, setIdx] = useState(0);
  const items = data.length > 0 ? data : [{ currencyCode: '—', todayVolume: '0', yesterdayVolume: '0', changePercent: '0', currencyId: '', products: [] }];

  useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => setIdx((p) => (p + 1) % data.length), 3000);
    return () => clearInterval(timer);
  }, [data.length]);

  return (
    <div className="relative h-10 overflow-hidden">
      <div
        className="absolute inset-0 transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${idx * 40}px)` }}
      >
        {items.map((c, i) => {
          const t = parseFloat(c.changePercent) >= 0;
          return (
            <div key={i} className="flex h-10 items-center gap-1 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">{c.currencyCode}</span>
              <span className={t ? 'text-success-600' : 'text-error-600'}>
                {t ? '\u2191' : '\u2193'} {c.changePercent}%
              </span>
              <span className="ml-auto font-mono text-text-tertiary">
                vs {formatCompact(c.yesterdayVolume)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  trend,
  trendLabel,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down';
  trendLabel?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
        {icon}
      </span>
    </div>
    <div>
      <p className="font-mono text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
      {trend && (
        <div className="mt-1 flex items-center gap-1">
          {trend === 'up'
            ? <ArrowTrendingUpIcon className="w-3 h-3 text-success-500" />
            : <ArrowTrendingDownIcon className="w-3 h-3 text-error-500" />
          }
          <span className="text-xs text-text-tertiary">{trendLabel}</span>
        </div>
      )}
      {children}
    </div>
  </div>
);

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border-primary bg-surface-primary p-3 shadow-lg">
      <p className="mb-1 text-xs text-text-secondary">{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="text-sm font-medium" style={{ color: e.color }}>
          {e.name}: {formatCurrency(e.value)}
        </p>
      ))}
    </div>
  );
};

const statusColors: Record<string, string> = {
  APPROVED: 'bg-success-50 text-success-700 border-success-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  DRAFT: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-error-50 text-error-700 border-error-200',
};

const typeColors: Record<string, string> = {
  SALE: 'text-emerald-600',
  PURCHASE: 'text-red-600',
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [chartDays, setChartDays] = useState(7);

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 60000,
  });

  const { data: volByCurrency = [] } = useQuery({
    queryKey: ['dashboard', 'vol-by-currency'],
    queryFn: () => dashboardApi.getVolumeByCurrency(),
    refetchInterval: 60000,
  });

  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard', 'volume-chart', chartDays],
    queryFn: () => dashboardApi.getVolumeChart(chartDays),
  });

  const { data: recentTxns = [], isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard', 'recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(10),
    refetchInterval: 30000,
  });

  const { data: pendingApprovals = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['dashboard', 'pending-approvals'],
    queryFn: () => dashboardApi.getPendingApprovals(10),
    refetchInterval: 30000,
    enabled: true,
  });

  const { data: latestRates = [] } = useQuery({
    queryKey: ['currency-rates', 'latest'],
    queryFn: () => currencyRatesApi.getLatestRates(),
    refetchInterval: 60000,
  });

  const chartVolume = useMemo(() => {
    return chartData.map((d) => ({
      ...d,
      saleVolume: parseFloat(d.saleVolume),
      purchaseVolume: parseFloat(d.purchaseVolume),
    }));
  }, [chartData]);

  const volumeTrend = useMemo(() => {
    if (!stats) return { trend: 'up' as const, label: '' };
    const t = parseFloat(stats.todayVolume);
    const y = parseFloat(stats.yesterdayVolume);
    if (y === 0) return { trend: 'up' as const, label: 'vs yesterday' };
    const pct = ((t - y) / y * 100).toFixed(1);
    return {
      trend: t >= y ? 'up' as const : 'down' as const,
      label: `${pct}% vs yesterday`,
    };
  }, [stats]);

  const txnTrend = useMemo(() => {
    if (!stats) return { trend: 'up' as const, label: '' };
    const diff = stats.todayTransactionCount - stats.yesterdayTransactionCount;
    return {
      trend: diff >= 0 ? 'up' as const : 'down' as const,
      label: `${Math.abs(diff)} ${diff >= 0 ? 'more' : 'fewer'} than yesterday`,
    };
  }, [stats]);

  const handleTxnClick = useCallback((txn: RecentTransaction) => {
    navigate(`/transactions/${txn.id}`);
  }, [navigate]);

  const handlePartyProfileClick = useCallback((id: string, type: string) => {
    navigate(`/party-profiles/${type.toLowerCase()}/edit/${id}`);
  }, [navigate]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<ChartBarIcon className="w-4 h-4" />}
          label="Today's Volume"
          value={'\u20B9' + formatCompact(stats?.todayVolume ?? '0')}
          trend={volumeTrend.trend}
          trendLabel={volumeTrend.label}
        >
          <VolumeSlider data={volByCurrency} />
        </StatCard>
        <StatCard
          icon={<ArrowsRightLeftIcon className="w-4 h-4" />}
          label="Transactions Today"
          value={String(stats?.todayTransactionCount ?? 0)}
          trend={txnTrend.trend}
          trendLabel={txnTrend.label}
        />
        <StatCard
          icon={<ClockIcon className="w-4 h-4" />}
          label="Pending Approvals"
          value={String(stats?.pendingApprovals ?? 0)}
        >
          <div className="mt-1 text-xs text-text-tertiary">
            {stats && stats.pendingPartyProfileReviews > 0
              ? `${stats.pendingPartyProfileReviews} require review`
              : 'No pending items'}
          </div>
        </StatCard>
        <StatCard
          icon={<ExclamationTriangleIcon className="w-4 h-4" />}
          label="Compliance Alerts"
          value={String(stats?.activeAlerts ?? 0)}
        >
          <div className="mt-1 text-xs text-text-tertiary">
            {stats && stats.activeAlerts > 0
              ? `${stats.activeAlerts} flagged transaction(s)`
              : 'No alerts'}
          </div>
        </StatCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <section className="rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Transaction Volume — Last {chartDays} Days
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 rounded-md border border-border-primary bg-surface-secondary p-0.5">
                  {[7, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setChartDays(d)}
                      className={
                        'rounded-sm px-2 py-1 text-xs font-medium transition-colors ' +
                        (chartDays === d
                          ? 'bg-primary-500 text-text-inverse'
                          : 'text-text-secondary hover:text-text-primary')
                      }
                    >
                      {d}d
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="cursor-pointer rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
                  onClick={() => setChartDays(chartDays)}
                  title="Refresh"
                >
                  <ArrowPathIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
            {chartLoading ? (
              <Loader variant="inline" size="sm" />
            ) : chartVolume.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-text-tertiary">
                No data for this period
              </div>
            ) : (
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartVolume}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1853DB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1853DB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D0DAE8" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#5A6E87' }}
                      tickLine={false}
                      axisLine={{ stroke: '#D0DAE8' }}
                      tickFormatter={(v) => {
                        const d = new Date(v + 'T00:00:00');
                        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#5A6E87' }}
                      tickLine={false}
                      axisLine={{ stroke: '#D0DAE8' }}
                      tickFormatter={(v) => formatCompact(v)}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="saleVolume"
                      name="Volume"
                      stroke="#1853DB"
                      fill="url(#volGrad)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#1853DB' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border-primary bg-surface-primary shadow-sm">
            <div className="flex items-center justify-between border-b border-border-primary px-4 pb-3 pt-4">
              <h2 className="text-sm font-semibold text-text-primary">Recent Transactions</h2>
              <div className="flex items-center gap-2">
                {recentTxns.length > 0 && (
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border-primary bg-surface-secondary px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-accent"
                    onClick={() => navigate('/purchase')}
                  >
                    <EyeIcon className="w-3 h-3" />
                    View All
                  </button>
                )}
              </div>
            </div>
            {recentLoading ? (
              <Loader variant="inline" size="sm" />
            ) : recentTxns.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-text-tertiary">
                No transactions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border-primary">
                      <th className="px-4 py-2.5 text-left font-medium text-text-tertiary">Txn ID</th>
                      <th className="px-4 py-2.5 text-left font-medium text-text-tertiary">Customer</th>
                      <th className="px-4 py-2.5 text-left font-medium text-text-tertiary">Pair</th>
                      <th className="px-4 py-2.5 text-left font-medium text-text-tertiary">Type</th>
                      <th className="px-4 py-2.5 text-left font-medium text-text-tertiary">FCY Amt</th>
                      <th className="px-4 py-2.5 text-left font-medium text-text-tertiary">LCY Amt</th>
                      <th className="px-4 py-2.5 text-left font-medium text-text-tertiary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTxns.map((txn) => (
                      <tr
                        key={txn.id}
                        className="cursor-pointer border-b border-border-primary transition-colors last:border-b-0 hover:bg-surface-secondary"
                        onClick={() => handleTxnClick(txn)}
                      >
                        <td className="px-4 py-2.5 font-mono text-primary">{txn.number || '\u2014'}</td>
                        <td className="px-4 py-2.5 text-text-primary">{txn.partyName || '\u2014'}</td>
                        <td className="px-4 py-2.5 font-mono font-medium text-text-primary">
                          {txn.currencyCode}/{txn.productCode}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={'font-medium ' + (typeColors[txn.transactionType] || '')}>
                            {txn.transactionType === 'SALE' ? 'Buy' : 'Sell'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-text-primary">{formatCurrency(txn.fcyAmount)}</td>
                        <td className="px-4 py-2.5 font-mono text-text-primary">MYR {formatCurrency(txn.lcyAmount)}</td>
                        <td className="px-4 py-2.5">
                          <span className={'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ' + (statusColors[txn.status] || statusColors.DRAFT)}>
                            {txn.status === 'APPROVED' ? 'Completed' : txn.status === 'PENDING' ? 'Under Review' : txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Pending Approvals</h2>
              <span className="font-mono text-xs font-semibold text-amber-600">
                {pendingApprovals.length} items
              </span>
            </div>
            {pendingLoading ? (
              <Loader variant="inline" size="sm" />
            ) : pendingApprovals.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-tertiary">No pending approvals</div>
            ) : (
              <div className="space-y-2.5">
                {pendingApprovals.slice(0, 5).map((profile) => (
                  <div
                    key={profile.id}
                    className="cursor-pointer rounded-md border border-border-primary p-3 transition-colors hover:bg-surface-secondary"
                    onClick={() => handlePartyProfileClick(profile.id, profile.type)}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span className="font-mono text-xs text-primary">{profile.code}</span>
                      <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs font-medium text-text-primary">{profile.name}</p>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      {profile.type} · {formatDateTime(profile.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Live Rates</h2>
              <span className="flex items-center gap-1 text-xs text-success-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
                Live
              </span>
            </div>
            {latestRates.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-tertiary">No rates available</div>
            ) : (
              <div className="space-y-1.5">
                {latestRates.slice(0, 8).map((rate: ICurrencyRate) => {
                  const buy = parseFloat(rate.baseBuyRate || '0');
                  const sale = parseFloat(rate.baseSaleRate || '0');
                  const mid = ((buy + sale) / 2).toFixed(4);
                  return (
                    <div key={rate.id} className="flex items-center justify-between border-b border-border-primary py-1.5 last:border-b-0">
                      <span className="font-mono text-xs font-medium text-text-primary">
                        {rate.currency?.currencyCode || rate.currencyId?.slice(0, 8) || '\u2014'}/MYR
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-xs text-text-primary">{mid}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
