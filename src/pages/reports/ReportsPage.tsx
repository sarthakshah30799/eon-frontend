import { Navigate, useLocation, useParams } from 'react-router-dom';
import ReportSalePurchaseView, {
  CardBlankStockReportView,
  CardSettledReportView,
  CardUnsettledReportView,
  CurrencyBalanceReportView,
  Flm1DailyCnSummaryView,
  Flm2DailyEtSummaryView,
  Flm3PurchaseFromPublicView,
  Flm4PurchaseFromFfmcView,
  Flm5SalesToPublicView,
  Flm6SalesToFfmcView,
  Flm7SurrenderStatementView,
  Flm8CnStatementView,
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
    case ReportPageTypeEnum.CARD_BLANK_STOCK:
      return <CardBlankStockReportView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM1_DAILY_CN_SUMMARY:
      return <Flm1DailyCnSummaryView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM2_DAILY_ET_SUMMARY:
      return <Flm2DailyEtSummaryView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM3_PURCHASE_FROM_PUBLIC:
      return <Flm3PurchaseFromPublicView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM4_PURCHASE_FROM_FFMC:
      return <Flm4PurchaseFromFfmcView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM5_SALES_TO_PUBLIC:
      return <Flm5SalesToPublicView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM6_SALES_TO_FFMC:
      return <Flm6SalesToFfmcView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM7_SURRENDER_STATEMENT:
      return <Flm7SurrenderStatementView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.FLM8_CN_STATEMENT:
      return <Flm8CnStatementView key={`${slug}${location.search}`} />;
    case ReportPageTypeEnum.SALE_PURCHASE:
    default:
      return <ReportSalePurchaseView key={`${slug}${location.search}`} />;
  }
};

export default ReportsPage;
