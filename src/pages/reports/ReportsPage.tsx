import { Navigate, useParams } from 'react-router-dom';
import ReportSalePurchaseView from '@/modules/reports/views';
import ProductProfitReportView from '@/modules/reports/views/ProductProfitReportView';
import SpecialReportView from '@/modules/reports/views/SpecialReportView';
import {
  REPORT_PAGE_DEFAULT_TYPE,
  getReportPageCanonicalSlug,
  getReportPageTypeFromSlug,
  ReportPageTypeEnum,
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

  const canonicalSlug = getReportPageCanonicalSlug(slug);

  if (canonicalSlug && slug.trim().toLowerCase() !== canonicalSlug) {
    return <Navigate replace to={`/reports/${canonicalSlug}`} />;
  }

  switch (reportPageType) {
    case ReportPageTypeEnum.SPECIAL:
      return <SpecialReportView />;
    case ReportPageTypeEnum.PRODUCT_PROFIT:
      return <ProductProfitReportView />;
    case ReportPageTypeEnum.SALE_PURCHASE:
    default:
      return <ReportSalePurchaseView />;
  }
};

export default ReportsPage;
