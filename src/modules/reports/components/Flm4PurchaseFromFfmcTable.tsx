import { FLM4_PURCHASE_FROM_FFMC_TEXT } from '../constants/flm4PurchaseFromFfmcConstants';
import { FlmRegisterReportTable } from './FlmRegisterReportTable';
import type { IFlm4PurchaseFromFfmcResponse } from '../types';

interface Flm4PurchaseFromFfmcTableProps {
  report: IFlm4PurchaseFromFfmcResponse | null;
  loading?: boolean;
}

export const Flm4PurchaseFromFfmcTable = ({
  report,
  loading = false,
}: Flm4PurchaseFromFfmcTableProps) => (
  <FlmRegisterReportTable
    report={report}
    loading={loading}
    loadingMessage={FLM4_PURCHASE_FROM_FFMC_TEXT.loadingMessage}
    emptyMessage={FLM4_PURCHASE_FROM_FFMC_TEXT.emptyMessage}
  />
);

export default Flm4PurchaseFromFfmcTable;
