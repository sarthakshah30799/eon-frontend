import { EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button1';
import type { RecentTransaction } from '@/api/dashboard/dashboard.api';
import { formatCurrency } from '../hooks/useDashboard';

interface RecentTransactionsTableProps {
  transactions: RecentTransaction[];
  loading?: boolean;
  onRowClick: (txn: RecentTransaction) => void;
}

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

const RecentTransactionsTable = ({ transactions, loading = false, onRowClick }: RecentTransactionsTableProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-lg border border-border-primary bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-primary px-4 pb-3 pt-4">
        <h2 className="text-sm font-semibold text-text-primary">Recent Transactions</h2>
        {transactions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/purchase')}
          >
            <EyeIcon className="w-3 h-3" />
            View All
          </Button>
        )}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader variant="inline" size="sm" />
        </div>
      ) : transactions.length === 0 ? (
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
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="cursor-pointer border-b border-border-primary transition-colors last:border-b-0 hover:bg-surface-secondary"
                  onClick={() => onRowClick(txn)}
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
  );
};

export default RecentTransactionsTable;
