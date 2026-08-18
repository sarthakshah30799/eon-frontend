import { Navigate, useLocation, useParams } from 'react-router-dom';
import ReportSalePurchaseView, {
  CardSettledReportView,
  CardUnsettledReportView,
  CurrencyBalanceReportView,
  ProductProfitReportView,
  SpecialReportView,
} from '@/modules/reports/views';
import {
  REPORT_PAGE_DEFAULT_TYPE,
  getReportPageCanonicalSlug,
  getReportPageTypeFromSlug,
  ReportPageTypeEnum,
} from '@/modules/reports/types';

const ReportsPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const reportPageType = getReportPageTypeFromSlug(slug);

  if (!slug) {
    return <Navigate replace to={`/reports/${REPORT_PAGE_DEFAULT_TYPE}${location.search}`} />;
  }

  if (!reportPageType) {
    return <Navigate replace to={`/reports/${REPORT_PAGE_DEFAULT_TYPE}${location.search}`} />;
  }

  const canonicalSlug = getReportPageCanonicalSlug(slug);

  if (canonicalSlug && slug.trim().toLowerCase() !== canonicalSlug) {
    return <Navigate replace to={`/reports/${canonicalSlug}${location.search}`} />;
  }

  switch (reportPageType) {
    case ReportPageTypeEnum.SPECIAL:
      return <SpecialReportView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.CURRENCY_BALANCE:
      return <CurrencyBalanceReportView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.PRODUCT_PROFIT:
      return <ProductProfitReportView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.CARD_UNSETTLED:
      return <CardUnsettledReportView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.CARD_SETTLED:
      return <CardSettledReportView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.SALE_PURCHASE:
    default:
      return <ReportSalePurchaseView key={`${slug}${location.search}`} />;
  }
};

export default ReportsPage;
