import { Form, FormFieldDatePicker, FormFieldInput } from '@/components/forms';
import { Button, Modal } from '@/components/ui';
import type { CardStockSettlement, BulkSettleCardStockPayload } from '@/api/cardSettlement';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  items: CardStockSettlement[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: BulkSettleCardStockPayload) => Promise<void>;
}

const groupedTotals = (items: CardStockSettlement[], key: 'currency' | 'issuer') => Object.values(items.reduce<Record<string, { label: string; amount: number }>>((result, item) => {
  const snapshot = key === 'currency' ? item.currencySnapshot : item.issuerPartyProfileSnapshot;
  const id = key === 'currency' ? item.currencyId : item.issuerPartyProfileId;
  const label = snapshot?.label ?? snapshot?.currencyCode ?? snapshot?.name ?? snapshot?.code ?? id;
  result[id] = { label, amount: (result[id]?.amount ?? 0) + Number(item.settlementAmount) };
  return result;
}, {}));

export const CardSettlementBulkModal = ({ open, items, submitting, onClose, onSubmit }: Props) => {
  const currencyTotals = groupedTotals(items, 'currency');
  const issuerTotals = groupedTotals(items, 'issuer');
  const selectedAmount = items.reduce((total, item) => total + Number(item.settlementAmount), 0);
  return <Modal open={open} onOpenChange={value => { if (!value && !submitting) onClose(); }} title="Confirm Issuer Settlement" description={`${items.length} card item${items.length === 1 ? '' : 's'} will be settled atomically.`} size="lg" footer={<div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={submitting} onClick={onClose}>Cancel</Button><Button type="submit" form="card-settlement-bulk-form" disabled={submitting || items.length === 0}>{submitting ? 'Settling...' : 'Confirm Settlement'}</Button></div>}>
    <Form<{ issuerSettlementDate: string; issuerReference: string }> id="card-settlement-bulk-form" defaultValues={{ issuerSettlementDate: '', issuerReference: '' }} onSubmit={async values => { if (!values.issuerSettlementDate) { toast.error('Issuer settlement date is required'); return; } if (!values.issuerReference.trim()) { toast.error('Issuer reference is required'); return; } await onSubmit({ settlementIds: items.map(item => item.id), issuerSettlementDate: values.issuerSettlementDate, issuerReference: values.issuerReference.trim() }); }}>
      <div className="grid gap-4 sm:grid-cols-2"><FormFieldDatePicker name="issuerSettlementDate" label="Issuer Settlement Date" dateFormat="dd/MM/yyyy" /><FormFieldInput name="issuerReference" label="Issuer Reference" valueTransform="none" /></div>
      <div className="mt-5 rounded-sm border border-border-primary bg-surface-secondary p-3 text-sm font-semibold text-text-primary">Selected total: {selectedAmount.toFixed(2)}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-sm border border-border-primary p-3"><h3 className="mb-2 text-sm font-semibold text-text-primary">Currency totals</h3>{currencyTotals.map(total => <div key={total.label} className="flex justify-between text-sm text-text-secondary"><span>{total.label}</span><span>{total.amount.toFixed(2)}</span></div>)}</div><div className="rounded-sm border border-border-primary p-3"><h3 className="mb-2 text-sm font-semibold text-text-primary">Issuer totals</h3>{issuerTotals.map(total => <div key={total.label} className="flex justify-between text-sm text-text-secondary"><span>{total.label}</span><span>{total.amount.toFixed(2)}</span></div>)}</div></div>
    </Form>
  </Modal>;
};
