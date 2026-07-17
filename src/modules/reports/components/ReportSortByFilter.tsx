import { Dropdown } from '@/components/ui';
import { ReportSortByEnum, type ReportSortBy } from '../types';

const SORT_OPTIONS: Array<{ id: ReportSortBy; label: string }> = [
  { id: ReportSortByEnum.DATE_ASC, label: 'Date Asc' },
  { id: ReportSortByEnum.DATE_DESC, label: 'Date Desc' },
];

interface ReportSortByFilterProps {
  value: ReportSortBy;
  onChange: (value: ReportSortBy) => void;
}

export const ReportSortByFilter = ({
  value,
  onChange,
}: ReportSortByFilterProps) => {
  const currentLabel =
    SORT_OPTIONS.find(option => option.id === value)?.label ?? 'Date Asc';

  return (
    <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          Sort By
        </div>
        <span className="text-[10px] text-text-tertiary">2 options</span>
      </div>

      <div className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
        <Dropdown>
          <Dropdown.Trigger className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-[11px] font-medium text-text-primary shadow-none">
            {currentLabel}
          </Dropdown.Trigger>
          <Dropdown.Menu className="min-w-full">
            {SORT_OPTIONS.map(option => (
              <Dropdown.Item
                key={option.id}
                onClick={() => onChange(option.id)}
                className="justify-between text-[11px]"
              >
                <span>{option.label}</span>
                {value === option.id ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                    Selected
                  </span>
                ) : null}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default ReportSortByFilter;
