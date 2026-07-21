import type { ICurrencyRate } from '@/modules/currencyRates/types/currencyRatesTypes';

interface LiveRatesProps {
  rates: ICurrencyRate[];
}

const LiveRates = ({ rates }: LiveRatesProps) => (
  <section className="rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-text-primary">Live Rates</h2>
      <span className="flex items-center gap-1 text-xs text-success-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
        Live
      </span>
    </div>
    {rates.length === 0 ? (
      <div className="py-6 text-center text-xs text-text-tertiary">No rates available</div>
    ) : (
      <div className="max-h-[300px] space-y-1.5 overflow-y-auto">
        {rates.slice(0, 8).map((rate: ICurrencyRate) => {
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
);

export default LiveRates;
