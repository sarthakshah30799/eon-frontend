import { useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal } from '@/components/ui';
import { parseDateInput } from '@/utils';

export interface IPurchaseCdfDeclarationValues {
  cdfNo: string;
  cdfIssuingAuthority: string;
  cdfArrivalDate: string;
  cdfApprovedUsd: string;
}

interface PurchaseCdfDeclarationModalProps {
  open: boolean;
  initialValues?: IPurchaseCdfDeclarationValues;
  onOpenChange: (open: boolean) => void;
  onConfirm: (values: IPurchaseCdfDeclarationValues) => void;
}

const createEmptyValues = (): IPurchaseCdfDeclarationValues => ({
  cdfNo: '',
  cdfIssuingAuthority: '',
  cdfArrivalDate: '',
  cdfApprovedUsd: '',
});

export const PurchaseCdfDeclarationModal = ({
  open,
  initialValues,
  onOpenChange,
  onConfirm,
}: PurchaseCdfDeclarationModalProps) => {
  const [values, setValues] = useState<IPurchaseCdfDeclarationValues>(
    () => initialValues ?? createEmptyValues()
  );
  const modalKey = `${open ? 'open' : 'closed'}-${JSON.stringify(
    initialValues ?? createEmptyValues()
  )}`;

  const canConfirm = useMemo(
    () =>
      Boolean(
        values.cdfNo.trim() &&
        values.cdfIssuingAuthority.trim() &&
        values.cdfArrivalDate.trim() &&
        values.cdfApprovedUsd.trim()
      ),
    [values]
  );

  return (
    <Modal
      key={modalKey}
      open={open}
      onOpenChange={onOpenChange}
      title="CDF Declaration"
      description="Complete the declaration details required for this purchase before you submit."
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="CDF No."
            value={values.cdfNo}
            onChange={event =>
              setValues(prev => ({ ...prev, cdfNo: event.target.value }))
            }
            placeholder="Enter CDF number"
          />
          <Input
            label="Issuing Authority"
            value={values.cdfIssuingAuthority}
            onChange={event =>
              setValues(prev => ({
                ...prev,
                cdfIssuingAuthority: event.target.value,
              }))
            }
            placeholder="Enter issuing authority"
          />
          <DatePicker
            label="Arrival Date"
            selected={parseDateInput(values.cdfArrivalDate)}
            onChange={date =>
              setValues(prev => ({
                ...prev,
                cdfArrivalDate: date ? date.toISOString().slice(0, 10) : '',
              }))
            }
            placeholder="Select arrival date"
          />
          <Input
            label="Approved USD"
            type="number"
            inputMode="decimal"
            value={values.cdfApprovedUsd}
            onChange={event =>
              setValues(prev => ({
                ...prev,
                cdfApprovedUsd: event.target.value,
              }))
            }
            placeholder="Enter approved USD"
            valueTransform="none"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(values)}
          >
            Confirm CDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PurchaseCdfDeclarationModal;
