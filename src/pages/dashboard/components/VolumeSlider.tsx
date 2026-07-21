import { useEffect, useState } from 'react';
import type { VolumeByCurrency } from '@/api/dashboard/dashboard.api';
import { formatCompact } from '@/utils';

interface VolumeSliderProps {
  data: VolumeByCurrency[];
}

const VolumeSlider = ({ data }: VolumeSliderProps) => {
  const [idx, setIdx] = useState(0);
  const items = data.length > 0
    ? data
    : [{ currencyCode: '\u2014', todayVolume: '0', yesterdayVolume: '0', changePercent: '0', currencyId: '', products: [] }];

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
          const isUp = parseFloat(c.changePercent) >= 0;
          return (
            <div key={i} className="flex h-10 items-center gap-1 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">{c.currencyCode}</span>
              <span className={isUp ? 'text-success-600' : 'text-error-600'}>
                {isUp ? '\u2191' : '\u2193'} {c.changePercent}%
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

export default VolumeSlider;
