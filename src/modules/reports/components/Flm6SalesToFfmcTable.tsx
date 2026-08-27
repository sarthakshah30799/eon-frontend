import { FLM6_SALES_TO_FFMC_TEXT } from '../constants/flm6SalesToFfmcConstants';
import { FlmRegisterReportTable } from './FlmRegisterReportTable';
import type { IFlm6SalesToFfmcResponse } from '../types';

interface Flm6SalesToFfmcTableProps {
  report: IFlm6SalesToFfmcResponse | null;
  loading?: boolean;
}

export const Flm6SalesToFfmcTable = ({
  report,
  loading = false,
}: Flm6SalesToFfmcTableProps) => (
  <FlmRegisterReportTable
    report={report}
    loading={loading}
    loadingMessage={FLM6_SALES_TO_FFMC_TEXT.loadingMessage}
    emptyMessage={FLM6_SALES_TO_FFMC_TEXT.emptyMessage}
  />
);

export default Flm6SalesToFfmcTable;
