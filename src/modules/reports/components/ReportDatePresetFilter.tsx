import { useMemo } from 'react';
import { Button, DatePicker } from '@/components/ui';
import { parseDateInput } from '@/utils';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type ReportDatePreset,
} from '../types';
import { buildReportDateRange } from '../utils';

interface ReportDatePresetFilterProps {
  value: IReportDateRange;
  onChange: (nextValue: IReportDateRange) => void;
}

const PRESET_BUTTONS: Array<{ value: ReportDatePreset; label: string }> = [
  { value: ReportDatePresetEnum.TODAY, label: 'Today' },
  { value: ReportDatePresetEnum.YESTERDAY, label: 'Yesterday' },
  { value: ReportDatePresetEnum.CURRENT_WEEK, label: 'Current Week' },
  { value: ReportDatePresetEnum.LAST_WEEK, label: 'Last Week' },
  { value: ReportDatePresetEnum.CURRENT_MONTH, label: 'Current Month' },
  { value: ReportDatePresetEnum.LAST_MONTH, label: 'Last Month' },
  { value: ReportDatePresetEnum.CUSTOM, label: 'Custom Range' },
];

export const ReportDatePresetFilter = ({
  value,
  onChange,
}: ReportDatePresetFilterProps) => {
  const isCustom = value.preset === ReportDatePresetEnum.CUSTOM;

  const selectedStartDate = useMemo(
    () => parseDateInput(value.startDate),
    [value.startDate],
  );
  const selectedEndDate = useMemo(
    () => parseDateInput(value.endDate),
    [value.endDate],
  );

  const handlePresetClick = (preset: ReportDatePreset) => {
    onChange(buildReportDateRange(preset));
  };

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
        Date
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESET_BUTTONS.map(button => (
          <Button
            key={button.value}
            type="button"
            variant={value.preset === button.value ? 'default' : 'outline'}
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => handlePresetClick(button.value)}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {isCustom && (
        <div className="grid gap-3 md:grid-cols-2">
          <DatePicker
            label="Start Date"
            selected={selectedStartDate}
            onChange={date => {
              onChange({
                ...value,
                startDate: date ? date.toISOString().slice(0, 10) : '',
              });
            }}
            placeholder="Select start date"
          />
          <DatePicker
            label="End Date"
            selected={selectedEndDate}
            onChange={date => {
              onChange({
                ...value,
                endDate: date ? date.toISOString().slice(0, 10) : '',
              });
            }}
            placeholder="Select end date"
          />
        </div>
      )}
    </div>
  );
};

export default ReportDatePresetFilter;
