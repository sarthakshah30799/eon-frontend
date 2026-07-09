import { Label } from '@/components/ui';

interface PurchaseReferenceNumberFieldProps {
  value: string;
  placeholder: string;
  helperText?: string;
}

export const PurchaseReferenceNumberField = ({
  value,
  placeholder,
  helperText,
}: PurchaseReferenceNumberFieldProps) => {
  return (
    <div className="space-y-1">
      <Label>Reference Number</Label>
      <div
        className={`min-h-7.5 block w-full rounded-md border border-slate-400 bg-surface-primary px-3 py-1 text-[14px] shadow-none ${value ? 'text-text-primary' : 'text-text-tertiary'}`}
        aria-readonly="true"
      >
        {value || placeholder}
      </div>
      <p className="text-[11px] leading-tight text-text-tertiary">
        {helperText ??
          'Format: 4-digit branch code + 2-digit financial year + 9-digit padded series. Final number is reserved on submit.'}
      </p>
    </div>
  );
};

export default PurchaseReferenceNumberField;
