import { Form, FormFieldDatePicker, FormFieldInput, FormFieldTextarea } from '@/components/forms';
import { Button, Modal } from '@/components/ui';
import type { CardStockSettlement, SubmitBranchCardSettlementPayload } from '@/api/cardSettlement';

interface Props {
  open: boolean;
  items: CardStockSettlement[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: SubmitBranchCardSettlementPayload) => Promise<void>;
}

export const CardBranchSettlementModal = ({ open, items, submitting, onClose, onSubmit }: Props) => (
  <Modal open={open} onOpenChange={value => { if (!value && !submitting) onClose(); }} title="Submit Branch Settlement" description={`${items.length} CARD item${items.length === 1 ? '' : 's'} will be submitted together.`} size="lg" footer={<div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={submitting} onClick={onClose}>Cancel</Button><Button type="submit" form="card-branch-settlement-form" disabled={submitting || items.length === 0}>{submitting ? 'Submitting...' : 'Submit Settlement'}</Button></div>}>
    <Form<{ settlementDate: string; reference: string; remarks: string }> id="card-branch-settlement-form" defaultValues={{ settlementDate: '', reference: '', remarks: '' }} onSubmit={values => onSubmit({ settlementIds: items.map(item => item.id), settlementDate: values.settlementDate, reference: values.reference.trim() || undefined, remarks: values.remarks.trim() || undefined })}>
      <div className="grid gap-4 sm:grid-cols-2"><FormFieldDatePicker name="settlementDate" label="Settlement Date" dateFormat="dd/MM/yyyy" /><FormFieldInput name="reference" label="Reference (Optional)" valueTransform="none" /></div>
      <div className="mt-4"><FormFieldTextarea name="remarks" label="Remarks (Optional)" rows={3} /></div>
      <div className="mt-4 rounded-sm border border-border-primary bg-surface-secondary p-3 text-sm font-semibold text-text-primary">Selected items: {items.length}</div>
    </Form>
  </Modal>
);
