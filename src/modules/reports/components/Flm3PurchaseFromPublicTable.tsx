import { FLM3_PURCHASE_FROM_PUBLIC_TEXT } from '../constants/flm3PurchaseFromPublicConstants';
import { FlmRegisterReportTable } from './FlmRegisterReportTable';
import type { IFlm3PurchaseFromPublicResponse } from '../types';

interface Flm3PurchaseFromPublicTableProps {
  report: IFlm3PurchaseFromPublicResponse | null;
  loading?: boolean;
}

export const Flm3PurchaseFromPublicTable = ({
  report,
  loading = false,
}: Flm3PurchaseFromPublicTableProps) => (
  <FlmRegisterReportTable
    report={report}
    loading={loading}
    loadingMessage={FLM3_PURCHASE_FROM_PUBLIC_TEXT.loadingMessage}
    emptyMessage={FLM3_PURCHASE_FROM_PUBLIC_TEXT.emptyMessage}
  />
);

export default Flm3PurchaseFromPublicTable;
