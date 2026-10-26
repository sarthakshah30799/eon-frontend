import {
  SALE_PURCHASE_DETAIL_OPTIONS,
  SALE_PURCHASE_GROUP_BY_OPTIONS,
  SALE_PURCHASE_REPORT_TEXT,
} from '../constants/salePurchaseReportConstants';
import type { SalePurchaseDetail, SalePurchaseGroupBy } from '../types';

interface RadioOption<T extends string> {
  id: T;
  label: string;
}

const ReportRadioGroup = <T extends string>({
  name,
  heading,
  value,
  options,
  onChange,
}: {
  name: string;
  heading: string;
  value: T;
  options: ReadonlyArray<RadioOption<T>>;
  onChange: (value: T) => void;
}) => (
  <div className="space-y-2 rounded-md border border-slate-200 p-3">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
      {heading}
    </div>
    <div className="space-y-2">
      {options.map(option => (
        <label
          key={option.id}
          className="flex items-center gap-2 text-[12px] text-text-primary"
        >
          <input
            type="radio"
            name={name}
            className="h-4 w-4 border-border-secondary text-primary-600"
            checked={value === option.id}
            onChange={() => onChange(option.id)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

interface SalePurchaseGroupByFilterProps {
  groupBy: SalePurchaseGroupBy;
  onGroupByChange: (value: SalePurchaseGroupBy) => void;
  detail: SalePurchaseDetail;
  onDetailChange: (value: SalePurchaseDetail) => void;
}

export const SalePurchaseGroupByFilter = ({
  groupBy,
  onGroupByChange,
  detail,
  onDetailChange,
}: SalePurchaseGroupByFilterProps) => {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ReportRadioGroup
        name="sale-purchase-group-by"
        heading={SALE_PURCHASE_REPORT_TEXT.groupByHeading}
        value={groupBy}
        options={SALE_PURCHASE_GROUP_BY_OPTIONS}
        onChange={onGroupByChange}
      />
      <ReportRadioGroup
        name="sale-purchase-detail"
        heading={SALE_PURCHASE_REPORT_TEXT.detailHeading}
        value={detail}
        options={SALE_PURCHASE_DETAIL_OPTIONS}
        onChange={onDetailChange}
      />
    </div>
  );
};

export default SalePurchaseGroupByFilter;
