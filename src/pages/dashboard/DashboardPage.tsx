import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useDashboard } from './hooks/useDashboard';
import { formatCompact } from '@/utils';
import StatCard from './components/StatCard';
import VolumeChart from './components/VolumeChart';
import VolumeSlider from './components/VolumeSlider';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import PendingApprovals from './components/PendingApprovals';
import LiveRates from './components/LiveRates';

const DashboardPage = () => {
  const {
    stats,
    volByCurrency,
    chartVolume,
    chartLoading,
    recentTxns,
    recentLoading,
    pendingApprovals,
    pendingLoading,
    latestRates,
    chartDays,
    setChartDays,
    volumeTrend,
    txnTrend,
    handleTxnClick,
    handleApprovalClick,
  } = useDashboard();

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
          <VolumeChart
            data={chartVolume}
            loading={chartLoading}
            days={chartDays}
            onDaysChange={setChartDays}
          />
          <RecentTransactionsTable
            transactions={recentTxns}
            loading={recentLoading}
            onRowClick={handleTxnClick}
          />
        </div>

        <div className="space-y-4">
          <PendingApprovals
            approvals={pendingApprovals}
            loading={pendingLoading}
            onItemClick={handleApprovalClick}
          />
          <LiveRates rates={latestRates} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
