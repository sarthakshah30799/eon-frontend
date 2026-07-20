import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Loader } from '@/components/ui/loader';
import { formatCompact, formatCurrency } from '../hooks/useDashboard';

interface ChartDataPoint {
  date: string;
  saleVolume: number;
  purchaseVolume: number;
}

interface VolumeChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  days: number;
  onDaysChange: (days: number) => void;
  onRefresh?: () => void;
  height?: number;
  showRefresh?: boolean;
  emptyMessage?: string;
}

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

const DAY_OPTIONS = [7, 30];

const VolumeChart = ({
  data,
  loading = false,
  days,
  onDaysChange,
  onRefresh,
  height = 180,
  showRefresh = true,
  emptyMessage = 'No data for this period',
}: VolumeChartProps) => (
  <section className="rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-text-primary">
        Transaction Volume — Last {days} Days
      </h2>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-md border border-border-primary bg-surface-secondary p-0.5">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDaysChange(d)}
              className={
                'rounded-sm px-2 py-1 text-xs font-medium transition-colors ' +
                (days === d
                  ? 'bg-primary-500 text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary')
              }
            >
              {d}d
            </button>
          ))}
        </div>
        {showRefresh && onRefresh && (
          <button
            type="button"
            className="cursor-pointer rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
            onClick={onRefresh}
            title="Refresh"
          >
            <ArrowPathIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
    {loading ? (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader variant="inline" size="sm" />
      </div>
    ) : data.length === 0 ? (
      <div className="flex items-center justify-center text-sm text-text-tertiary" style={{ height }}>
        {emptyMessage}
      </div>
    ) : (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
);

export default VolumeChart;
