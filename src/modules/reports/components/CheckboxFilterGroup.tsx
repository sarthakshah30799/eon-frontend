import { Checkbox } from '@/components/ui';
import type { IReportSelectOption } from '../types';

interface CheckboxFilterGroupProps {
  heading: string;
  options: IReportSelectOption[];
  selectedIds: string[];
  allSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  emptyMessage: string;
  helperText?: string;
  disabled?: boolean;
  compact?: boolean;
}

export const CheckboxFilterGroup = ({
  heading,
  options,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
  emptyMessage,
  helperText,
  disabled = false,
  compact = true,
}: CheckboxFilterGroupProps) => {
  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {heading}
        </div>
        <span className="text-[10px] text-text-tertiary">
          {selectedCount} selected
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
        <Checkbox
          checked={allSelected}
          onChange={checked => onToggleAll(checked)}
          disabled={disabled || options.length === 0}
          id={`${heading}-select-all`}
        >
          Select all
        </Checkbox>
        {helperText && (
          <span className="text-[10px] text-text-tertiary">{helperText}</span>
        )}
      </div>

      {options.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-[11px] text-text-tertiary">
          {emptyMessage}
        </div>
      ) : (
        <div
          className={[
            compact ? 'max-h-40' : 'max-h-56',
            'space-y-1 overflow-y-auto pr-1',
          ].join(' ')}
        >
          {options.map(option => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-100 bg-surface-primary px-2 py-1.5 transition hover:border-primary-200 hover:bg-primary-50/40"
            >
              <div className="min-w-0">
                <Checkbox
                  checked={selectedIds.includes(option.id)}
                  onChange={checked => onToggle(option.id, checked)}
                  disabled={disabled}
                  id={`${heading}-${option.id}`}
                >
                  <span className="block truncate text-[11px] font-medium text-text-primary">
                    {option.label}
                  </span>
                </Checkbox>
                {option.description && (
                  <span className="mt-0.5 block truncate text-[10px] text-text-tertiary">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckboxFilterGroup;
