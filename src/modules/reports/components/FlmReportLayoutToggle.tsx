import { Button } from '@/components/ui';
import {
  FLM_REPORT_LAYOUT_TEXT,
  FlmReportLayoutEnum,
  type FlmReportLayout,
} from '../constants/flmReportLayoutConstants';

interface FlmReportLayoutToggleProps {
  layout: FlmReportLayout;
  onChange: (layout: FlmReportLayout) => void;
}

export const FlmReportLayoutToggle = ({
  layout,
  onChange,
}: FlmReportLayoutToggleProps) => (
  <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
    <Button
      type="button"
      size="sm"
      variant={
        layout === FlmReportLayoutEnum.BRANCH_WISE ? 'default' : 'outline'
      }
      className="h-7 rounded-full px-3 text-[11px]"
      onClick={() => onChange(FlmReportLayoutEnum.BRANCH_WISE)}
    >
      {FLM_REPORT_LAYOUT_TEXT.branchWise}
    </Button>
    <Button
      type="button"
      size="sm"
      variant={
        layout === FlmReportLayoutEnum.CONSOLIDATE ? 'default' : 'outline'
      }
      className="h-7 rounded-full px-3 text-[11px]"
      onClick={() => onChange(FlmReportLayoutEnum.CONSOLIDATE)}
    >
      {FLM_REPORT_LAYOUT_TEXT.consolidate}
    </Button>
  </div>
);

export default FlmReportLayoutToggle;
