import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RowSelectionState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CardStockSettlementStatus, type CardStockSettlement, type CardStockSettlementFilters } from '@/api/cardSettlement';
import { branchProfileApi } from '@/api/branchProfile';
import { AsyncSelect, Button, Checkbox, DatePicker, Input, Modal, Table, type AsyncSelectOption, type TableColumnDef } from '@/components/ui';
import { Form, FormFieldTextarea } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { formatDateInput, formatDateTime } from '@/utils';
import { useCardStockReferences } from '@/modules/cardStock/hooks';
import { CARD_SETTLEMENT_TEXT } from '../constants/cardSettlementConstants';
import { useAcceptBranchSettlements, useBulkSettleCards, useCardSettlements, useRejectBranchSettlements, useSubmitBranchSettlements } from '../hooks';
import { CardBranchSettlementModal, CardSettlementBulkModal } from '../components';

const label = (snapshot: CardStockSettlement['currencySnapshot'], fallback: string) => snapshot?.label ?? snapshot?.currencyCode ?? snapshot?.name ?? snapshot?.code ?? fallback;

export const CardSettlementListView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const initialStatus = isHo ? CardStockSettlementStatus.PENDING_HO_ACCEPTANCE : CardStockSettlementStatus.PENDING_BRANCH_SETTLEMENT;
  const [filters, setFilters] = useState<CardStockSettlementFilters>({ status: initialStatus });
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const query = useCardSettlements(filters);
  const references = useCardStockReferences();
  const branchesQuery = useQuery({ queryKey: ['card-settlement', 'branches'], queryFn: () => branchProfileApi.getBranchProfiles({ activeOnly: true }) });
  const mutation = useBulkSettleCards();
  const submitBranch = useSubmitBranchSettlements();
  const acceptBranch = useAcceptBranchSettlements();
  const rejectBranch = useRejectBranchSettlements();
  const rows = useMemo(() => (query.data ?? []).filter(item => [item.maskedCardNumber, item.series, item.kitNumber, label(item.currencySnapshot, item.currencyId), label(item.issuerPartyProfileSnapshot, item.issuerPartyProfileId), label(item.branchSnapshot, item.branchId)].join(' ').toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  const selected = rows.filter(row => selection[row.id]);
  const selectedStatus = selected.length > 0 && selected.every(row => row.status === selected[0].status) ? selected[0].status : null;
  const nonSelectableStatuses = new Set<CardStockSettlement['status']>([
    CardStockSettlementStatus.ISSUER_SETTLED,
    CardStockSettlementStatus.CANCELLED,
  ]);
  const columns: TableColumnDef<CardStockSettlement>[] = [
    { id: 'select', header: ({ table }) => { const selectable = table.getRowModel().rows.filter(row => !nonSelectableStatuses.has(row.original.status)); const allSelected = selectable.length > 0 && selectable.every(row => row.getIsSelected()); return <Checkbox aria-label="Select all settlements" checked={allSelected} disabled={selectable.length === 0} onChange={checked => table.setRowSelection(Object.fromEntries(selectable.map(row => [row.id, checked])))} />; }, cell: ({ row }) => <Checkbox aria-label={`Select ${row.original.series}`} checked={row.getIsSelected()} disabled={nonSelectableStatuses.has(row.original.status)} onChange={row.getToggleSelectedHandler()} />, enableSorting: false },
    { accessorKey: 'maskedCardNumber', header: 'Card Number' }, { accessorKey: 'series', header: 'Series' }, { accessorKey: 'kitNumber', header: 'Kit Number' },
    { id: 'currency', header: 'Currency', cell: ({ row }) => label(row.original.currencySnapshot, row.original.currencyId) },
    { id: 'product', header: 'Product', cell: ({ row }) => label(row.original.productSnapshot, row.original.productId) },
    { id: 'issuer', header: 'Issuer', cell: ({ row }) => label(row.original.issuerPartyProfileSnapshot, row.original.issuerPartyProfileId) },
    { id: 'branch', header: 'Selling Branch', cell: ({ row }) => label(row.original.branchSnapshot, row.original.branchId) },
    { accessorKey: 'denomination', header: 'Denomination' }, { accessorKey: 'buyRate', header: 'Buy Rate' }, { accessorKey: 'settlementAmount', header: 'Amount' },
    { accessorKey: 'saleDate', header: 'Sale Date', cell: ({ row }) => formatDateTime(row.original.saleDate, 'DD/MM/YYYY') },
    { accessorKey: 'branchSettlementDate', header: 'Branch Settled', cell: ({ row }) => formatDateTime(row.original.branchSettlementDate) },
    { accessorKey: 'status', header: 'Status' },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <Button type="button" size="sm" variant="outline" onClick={() => navigate(`/card-settlement/${row.original.id}`)}>View</Button> },
  ];
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold text-text-primary">{CARD_SETTLEMENT_TEXT.title}</h1><p className="text-sm text-text-secondary">{CARD_SETTLEMENT_TEXT.description}</p></div><div className="flex flex-wrap gap-2">{selectedStatus === CardStockSettlementStatus.PENDING_BRANCH_SETTLEMENT && <Button type="button" onClick={() => setBranchModalOpen(true)}>Submit to HO ({selected.length})</Button>}{isHo && selectedStatus === CardStockSettlementStatus.PENDING_HO_ACCEPTANCE && <><Button type="button" variant="outline" onClick={() => setRejectOpen(true)}>Reject ({selected.length})</Button><Button type="button" onClick={async () => { await acceptBranch.mutateAsync(selected.map(item => item.id)); toast.success('Branch settlements accepted'); setSelection({}); }}>Accept ({selected.length})</Button></>}{isHo && selectedStatus === CardStockSettlementStatus.PENDING_ISSUER_SETTLEMENT && <Button type="button" onClick={() => setModalOpen(true)}>{CARD_SETTLEMENT_TEXT.settleSelected} ({selected.length})</Button>}</div></div>
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6"><div className="mb-4 flex flex-wrap items-end gap-3"><div className="min-w-64 flex-1"><Input label="Search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Card, series, issuer, currency or branch" /></div>{([undefined, CardStockSettlementStatus.PENDING_BRANCH_SETTLEMENT, CardStockSettlementStatus.PENDING_HO_ACCEPTANCE, CardStockSettlementStatus.PENDING_ISSUER_SETTLEMENT, CardStockSettlementStatus.ISSUER_SETTLED, CardStockSettlementStatus.CANCELLED] as const).map(value => <Button key={value ?? 'ALL'} type="button" size="sm" variant={filters.status === value ? 'default' : 'outline'} onClick={() => { setFilters(current => ({ ...current, status: value })); setSelection({}); }}>{value?.replaceAll('_', ' ') ?? 'ALL'}</Button>)}</div>
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AsyncSelect label="Issuer" defaultOptions loadOptions={async input => ({ options: references.issuers.filter(item => `${item.code} ${item.name}`.toLowerCase().includes(input.toLowerCase())).map(item => ({ value: item.id, label: `${item.code} - ${item.name}` })) })} value={references.issuers.filter(item => item.id === filters.issuerPartyProfileId).map(item => ({ value: item.id, label: `${item.code} - ${item.name}` }))[0] ?? null} onChange={option => setFilters(current => ({ ...current, issuerPartyProfileId: (option as AsyncSelectOption | null)?.value as string | undefined }))} />
        <AsyncSelect label="Currency" defaultOptions loadOptions={async input => ({ options: references.currencies.filter(item => `${item.currencyCode} ${item.currencyName}`.toLowerCase().includes(input.toLowerCase())).map(item => ({ value: item.id, label: `${item.currencyCode} - ${item.currencyName}` })) })} value={references.currencies.filter(item => item.id === filters.currencyId).map(item => ({ value: item.id, label: `${item.currencyCode} - ${item.currencyName}` }))[0] ?? null} onChange={option => setFilters(current => ({ ...current, currencyId: (option as AsyncSelectOption | null)?.value as string | undefined }))} />
        <AsyncSelect label="Selling Branch" defaultOptions loadOptions={async input => ({ options: (branchesQuery.data ?? []).filter(item => `${item.code} ${item.name}`.toLowerCase().includes(input.toLowerCase())).map(item => ({ value: item.id, label: `${item.code} - ${item.name}` })) })} value={(branchesQuery.data ?? []).filter(item => item.id === filters.branchId).map(item => ({ value: item.id, label: `${item.code} - ${item.name}` }))[0] ?? null} onChange={option => setFilters(current => ({ ...current, branchId: (option as AsyncSelectOption | null)?.value as string | undefined }))} />
        <div className="flex items-end"><Button type="button" variant="outline" onClick={() => { setFilters({ status: initialStatus }); setSearch(''); setSelection({}); }}>Clear Filters</Button></div>
        <DatePicker label="Sale Date From" selected={filters.saleDateFrom ? new Date(`${filters.saleDateFrom}T00:00:00`) : null} onChange={date => setFilters(current => ({ ...current, saleDateFrom: date ? formatDateInput(date) : undefined }))} />
        <DatePicker label="Sale Date To" selected={filters.saleDateTo ? new Date(`${filters.saleDateTo}T00:00:00`) : null} onChange={date => setFilters(current => ({ ...current, saleDateTo: date ? formatDateInput(date) : undefined }))} />
        <DatePicker label="Settlement Date From" selected={filters.settlementDateFrom ? new Date(`${filters.settlementDateFrom}T00:00:00`) : null} onChange={date => setFilters(current => ({ ...current, settlementDateFrom: date ? formatDateInput(date) : undefined }))} />
        <DatePicker label="Settlement Date To" selected={filters.settlementDateTo ? new Date(`${filters.settlementDateTo}T00:00:00`) : null} onChange={date => setFilters(current => ({ ...current, settlementDateTo: date ? formatDateInput(date) : undefined }))} />
      </div>
      <Table columns={columns} data={rows} loading={query.isLoading} enableFiltering={false} enableRowSelection rowSelection={selection} onRowSelectionChange={setSelection} getRowId={row => row.id} emptyMessage={query.error instanceof Error ? query.error.message : CARD_SETTLEMENT_TEXT.empty} />
    </section>
    <CardBranchSettlementModal open={branchModalOpen} items={selected} submitting={submitBranch.isPending} onClose={() => setBranchModalOpen(false)} onSubmit={async payload => { await submitBranch.mutateAsync(payload); toast.success('Branch settlement submitted'); setSelection({}); setBranchModalOpen(false); }} />
    <CardSettlementBulkModal open={modalOpen} items={selected} submitting={mutation.isPending} onClose={() => setModalOpen(false)} onSubmit={async payload => { try { await mutation.mutateAsync(payload); toast.success('CARD issuer settlement completed'); setSelection({}); setModalOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : 'CARD issuer settlement failed'); } }} />
    <Modal open={rejectOpen} onOpenChange={setRejectOpen} title="Reject Branch Settlements" description={`${selected.length} selected item${selected.length === 1 ? '' : 's'} will return to the branch.`}><Form<{ reason: string }> defaultValues={{ reason: '' }} onSubmit={async values => { await rejectBranch.mutateAsync({ ids: selected.map(item => item.id), reason: values.reason }); toast.success('Branch settlements rejected'); setSelection({}); setRejectOpen(false); }}><FormFieldTextarea name="reason" label="Rejection Reason" rows={4} /><div className="mt-4 flex justify-end"><Button type="submit" disabled={rejectBranch.isPending}>Reject</Button></div></Form></Modal>
  </div>;
};

export default CardSettlementListView;
