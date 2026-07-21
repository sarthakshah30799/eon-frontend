import type { ReactNode } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import type { Trend } from '../hooks/useDashboard';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: Trend;
  trendLabel?: string;
  children?: ReactNode;
}

const StatCard = ({ icon, label, value, trend, trendLabel, children }: StatCardProps) => (
  <div className="flex flex-col gap-3 rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
        {icon}
      </span>
    </div>
    <div>
      <p className="font-mono text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
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

export default StatCard;
