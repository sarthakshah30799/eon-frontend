import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { formatDateTime } from '@/utils';
import { useListCardStockReceipts } from '../hooks';
import type { CardStockReceipt } from '../types';

export const CardStockListView = () => {
  const navigate = useNavigate();
  const { data = [], isLoading, error } = useListCardStockReceipts();
  const columns: TableColumnDef<CardStockReceipt>[] = [
    { accessorKey: 'transactionNumber', header: 'Transaction Number' },
    { accessorKey: 'receiptDate', header: 'Transaction Date', cell: ({ row }) => formatDateTime(`${row.original.receiptDate?.slice(0, 10)}T00:00:00`, 'DD/MM/YYYY') },
    { accessorKey: 'issuerPartyProfileId', header: 'Card Issuer', cell: ({ row }) => row.original.issuerPartyProfileSnapshot?.label ?? row.original.issuerPartyProfileSnapshot?.name ?? row.original.issuerPartyProfileId },
    { accessorKey: 'totalFeAmount', header: 'Total FE Amount' },
    { accessorKey: 'status', header: 'Status' },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/card-stock/edit/${row.original.id}`)}>View</Button> },
  ];
  if (isLoading) return <Loader />;
  if (error) return <div className="py-6 text-center text-error-600">{error instanceof Error ? error.message : 'Failed to load card stock receipts'}</div>;
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold text-text-primary">Receipt Stock</h1><p className="text-sm text-text-secondary">Review CARD stock receipts created at the HO branch.</p></div><Button type="button" onClick={() => navigate('/card-stock/create')}>New Receipt Stock</Button></div><section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6"><Table columns={columns} data={data} loading={isLoading} enableSorting={false} enableFiltering={false} enablePagination={false} emptyMessage="No card stock receipts found." /></section></div>;
};

export default CardStockListView;
