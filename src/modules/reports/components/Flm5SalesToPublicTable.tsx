import { FLM5_SALES_TO_PUBLIC_TEXT } from '../constants/flm5SalesToPublicConstants';
import { FlmRegisterReportTable } from './FlmRegisterReportTable';
import type { IFlm5SalesToPublicResponse } from '../types';

interface Flm5SalesToPublicTableProps {
  report: IFlm5SalesToPublicResponse | null;
  loading?: boolean;
}

export const Flm5SalesToPublicTable = ({
  report,
  loading = false,
}: Flm5SalesToPublicTableProps) => (
  <FlmRegisterReportTable
    report={report}
    loading={loading}
    loadingMessage={FLM5_SALES_TO_PUBLIC_TEXT.loadingMessage}
    emptyMessage={FLM5_SALES_TO_PUBLIC_TEXT.emptyMessage}
  />
);

export default Flm5SalesToPublicTable;
