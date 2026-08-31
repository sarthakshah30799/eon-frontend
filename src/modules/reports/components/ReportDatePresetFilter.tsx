import { useMemo } from 'react';
import { Button, DatePicker } from '@/components/ui';
import { formatDateInput, parseDateInput } from '@/utils';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type ReportDatePreset,
} from '../types';
import { buildReportDateRange } from '../utils';

interface ReportDatePresetFilterProps {
  value: IReportDateRange;
  onChange: (nextValue: IReportDateRange) => void;
  showAllDates?: boolean;
  singleDayOnly?: boolean;
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

const SINGLE_DAY_PRESET_BUTTONS: Array<{
  value: ReportDatePreset;
  label: string;
}> = [
  { value: ReportDatePresetEnum.TODAY, label: 'Today' },
  { value: ReportDatePresetEnum.YESTERDAY, label: 'Yesterday' },
  { value: ReportDatePresetEnum.CUSTOM, label: 'Date' },
];

export const ReportDatePresetFilter = ({
  value,
  onChange,
  showAllDates = false,
  singleDayOnly = false,
}: ReportDatePresetFilterProps) => {
  const isCustom = value.preset === ReportDatePresetEnum.CUSTOM;
  const presetButtons = singleDayOnly
    ? SINGLE_DAY_PRESET_BUTTONS
    : showAllDates
      ? [
          { value: ReportDatePresetEnum.ALL, label: 'All Dates' },
          ...PRESET_BUTTONS,
        ]
      : PRESET_BUTTONS;

  const selectedStartDate = useMemo(
    () => parseDateInput(value.startDate),
    [value.startDate]
  );
  const selectedEndDate = useMemo(
    () => parseDateInput(value.endDate),
    [value.endDate]
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
        {presetButtons.map(button => (
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

      {isCustom && singleDayOnly && (
        <DatePicker
          label="Date"
          selected={selectedStartDate}
          onChange={date => {
            const nextDate = date ? formatDateInput(date) : '';
            onChange({
              ...value,
              startDate: nextDate,
              endDate: nextDate,
            });
          }}
          placeholder="Select date"
        />
      )}

      {isCustom && !singleDayOnly && (
        <div className="grid gap-3 md:grid-cols-2">
          <DatePicker
            label="Start Date"
            selected={selectedStartDate}
            onChange={date => {
              onChange({
                ...value,
                startDate: date ? formatDateInput(date) : '',
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
                endDate: date ? formatDateInput(date) : '',
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
