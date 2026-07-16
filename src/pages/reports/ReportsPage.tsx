import { Navigate, useParams } from 'react-router-dom';
import ReportSalePurchaseView from '@/modules/reports/views';
import {
  REPORT_PAGE_DEFAULT_TYPE,
  getReportPageTypeFromSlug,
} from '@/modules/reports/types';

const ReportsPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const reportPageType = getReportPageTypeFromSlug(slug);

  if (!slug) {
    return <Navigate replace to={`/reports/${REPORT_PAGE_DEFAULT_TYPE}`} />;
  }

  if (!reportPageType) {
    return <Navigate replace to={`/reports/${REPORT_PAGE_DEFAULT_TYPE}`} />;
  }

  return <ReportSalePurchaseView />;
};

export default ReportsPage;
