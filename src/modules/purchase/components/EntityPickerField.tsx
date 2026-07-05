import { Button, Label } from '@/components/ui';

interface EntityPickerFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
  disabled?: boolean;
  helperText?: string;
  buttonPosition?: 'side' | 'bottom';
}

export const EntityPickerField = ({
  label,
  value,
  placeholder,
  onClick,
  disabled = false,
  helperText,
  buttonPosition = 'side',
}: EntityPickerFieldProps) => {
  const isBottomButton = buttonPosition === 'bottom';

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div
        className={
          isBottomButton
            ? 'flex flex-col gap-1.5'
            : 'flex items-end gap-2'
        }
      >
        <div
          className={`min-h-7.5 block w-full flex-1 rounded-md border border-slate-400 bg-surface-primary px-3 py-1 text-[14px] text-text-primary shadow-none placeholder:text-text-tertiary focus:border-slate-500! focus:ring-slate-500 focus-visible:border-transparent! focus-visible:outline-slate-500 focus-visible:ring-1 ${value ? 'text-text-primary' : 'text-text-tertiary'}`}
        >
          {value || placeholder}
        </div>
        <Button
          type="button"
          variant="outline"
          className={isBottomButton ? '!h-7.5 w-full shrink-0 rounded-md px-3 py-1 text-[14px]' : '!h-7.5 shrink-0 rounded-md px-3 py-1 text-[14px]'}
          disabled={disabled}
          onClick={onClick}
        >
          Select
        </Button>
      </div>
      {helperText ? <p className="text-[11px] leading-tight text-text-tertiary">{helperText}</p> : null}
    </div>
  );
};

export default EntityPickerField;
