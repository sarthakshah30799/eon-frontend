export const FlmReportLayoutEnum = {
  BRANCH_WISE: 'branch_wise',
  CONSOLIDATE: 'consolidate',
} as const;

export type FlmReportLayout =
  (typeof FlmReportLayoutEnum)[keyof typeof FlmReportLayoutEnum];

export const DEFAULT_FLM_REPORT_LAYOUT = FlmReportLayoutEnum.BRANCH_WISE;

export const FLM_REPORT_LAYOUT_TEXT = {
  branchWise: 'Branch wise',
  consolidate: 'Consolidate',
} as const;

export const parseFlmReportLayout = (value: string): FlmReportLayout =>
  value === FlmReportLayoutEnum.CONSOLIDATE
    ? FlmReportLayoutEnum.CONSOLIDATE
    : FlmReportLayoutEnum.BRANCH_WISE;
