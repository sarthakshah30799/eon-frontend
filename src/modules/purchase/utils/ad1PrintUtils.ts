import type { ICompanyProfile } from '@/modules/companyProfile/types';
import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ITransactionAd1 } from '@/api/transactionAd1/transactionAd1.api';
import { toDisplayDate } from '@/utils';
import { AD1_PRINT_TEXT } from '../constants/ad1Constants';

type Ad1PrintCopyType = 'CUSTOMER_COPY' | 'DUPLICATE_COPY';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return '-';
  }
  if (value instanceof Date) {
    return toDisplayDate(value.toISOString().slice(0, 10)) || '-';
  }
  return toDisplayDate(value) || '-';
};

const joinAddress = (...parts: Array<string | null | undefined>) =>
  parts.map(part => part?.trim()).filter(Boolean).join(', ');

const display = (value?: string | null) => value?.trim() || '-';

const productName = (product: ITransactionAd1['productSnapshot']) =>
  product?.productDescription?.trim() || product?.productCode?.trim() || '-';

const currencyName = (currency: ITransactionAd1['currencySnapshot']) =>
  currency?.currencyName?.trim() || currency?.currencyCode?.trim() || '-';

const purposeName = (purpose: ITransactionAd1['purposeSnapshot']) =>
  purpose?.description?.trim() || purpose?.code?.trim() || '-';

const agentName = (agent: ITransactionAd1['agentSnapshot']) =>
  agent?.name?.trim() || agent?.code?.trim() || '-';

const bankName = (bank: ITransactionAd1['bankSnapshot']) =>
  bank?.accountName?.trim() || bank?.accountCode?.trim() || '-';

export const getAd1PrintCopyType = (printCount?: number | null): Ad1PrintCopyType =>
  (printCount ?? 0) === 0 ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';

export const getAd1PrintCopyLabel = (copyType: Ad1PrintCopyType) =>
  copyType === 'DUPLICATE_COPY' ? AD1_PRINT_TEXT.duplicateCopy : AD1_PRINT_TEXT.originalCopy;

export const buildAd1PrintHtml = ({
  copyType,
  transaction,
  company,
  branch,
}: {
  copyType: Ad1PrintCopyType;
  transaction: ITransactionAd1;
  company: ICompanyProfile | null;
  branch: IBranchProfile | null;
}) => {
  const documentNumber = transaction.number || transaction.docNo || '-';
  const copyLabel = getAd1PrintCopyLabel(copyType);
  const logoHtml = company?.logo
    ? `<img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.name)}" />`
    : `<div class="logo-fallback">${escapeHtml(company?.shortCode || company?.name || 'MARAEKAT')}</div>`;
  const branchAddress = joinAddress(
    branch?.address1,
    branch?.address2,
    branch?.address3,
    branch?.city,
    branch?.gstState,
    branch?.pinCode,
  );

  const infoRow = (label: string, value: string) =>
    `<div class="info-row"><span class="info-label">${escapeHtml(label)}:</span><span>${escapeHtml(value)}</span></div>`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(documentNumber)} - ${escapeHtml(copyLabel)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 24px; background: #fff; }
          .page { max-width: 1100px; margin: 0 auto; }
          .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 16px; }
          .header-center { text-align: center; flex: 1; }
          .header-right { text-align: right; font-weight: 700; white-space: nowrap; }
          .brand { display: flex; gap: 12px; align-items: center; min-width: 240px; }
          .brand img { width: 56px; height: 56px; object-fit: contain; }
          .logo-fallback { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: #111827; color: white; font-size: 12px; font-weight: 700; border-radius: 8px; padding: 4px; }
          .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.08em; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #374151; }
          .meta-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; margin-bottom: 16px; }
          .panel { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px 14px; }
          .panel-title { margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #111827; }
          .info-list { display: grid; gap: 4px; font-size: 12px; line-height: 1.4; }
          .info-row { display: flex; gap: 8px; }
          .info-label { min-width: 140px; font-weight: 700; }
          .section { margin-top: 14px; }
          .section h2 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; }
          .muted { color: #6b7280; }
          .copy-mark { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; }
          @media print { body { padding: 0; } .page { max-width: none; } }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              ${logoHtml}
              <div>
                <div style="font-size: 14px; font-weight: 700;">${escapeHtml(company?.name || '-')}</div>
                <div class="muted">${escapeHtml(branch?.name || '-')}</div>
              </div>
            </div>
            <div class="header-center">
              <h1>${escapeHtml(AD1_PRINT_TEXT.title)}</h1>
              <p>${escapeHtml(documentNumber)}</p>
            </div>
            <div class="header-right copy-mark">${escapeHtml(copyLabel)}</div>
          </div>

          <div class="meta-grid">
            <div class="panel">
              <p class="panel-title">${escapeHtml(AD1_PRINT_TEXT.companyBranch)}</p>
              <div class="info-list">
                ${infoRow(AD1_PRINT_TEXT.branchGst, branch?.gstNo || '-')}
                ${infoRow(AD1_PRINT_TEXT.invoiceNo, documentNumber)}
                ${infoRow(AD1_PRINT_TEXT.invoiceDate, formatDate(transaction.transactionDate))}
                ${infoRow(AD1_PRINT_TEXT.rbiLicNo, company?.aeonLicNo || '-')}
                ${infoRow(AD1_PRINT_TEXT.panNo, company?.panNo || '-')}
                ${infoRow(AD1_PRINT_TEXT.address, branchAddress || '-')}
                ${infoRow(AD1_PRINT_TEXT.contact, branch?.contactNo || '-')}
                ${infoRow(AD1_PRINT_TEXT.email, branch?.branchEmail || company?.email || '-')}
              </div>
            </div>
            <div class="panel">
              <p class="panel-title">${escapeHtml(AD1_PRINT_TEXT.remitter)}</p>
              <div class="info-list">
                ${infoRow(AD1_PRINT_TEXT.name, display(transaction.remitterName))}
                ${infoRow(AD1_PRINT_TEXT.pan, display(transaction.pan))}
                ${infoRow(AD1_PRINT_TEXT.address, display(transaction.address))}
                ${infoRow(AD1_PRINT_TEXT.contact, display(transaction.contactNo))}
                ${infoRow(AD1_PRINT_TEXT.email, display(transaction.email))}
                ${infoRow(AD1_PRINT_TEXT.dateOfBirth, formatDate(transaction.dateOfBirth))}
              </div>
            </div>
          </div>

          <div class="section panel">
            <p class="panel-title">${escapeHtml(AD1_PRINT_TEXT.beneficiary)}</p>
            <div class="info-list">
              ${infoRow(AD1_PRINT_TEXT.beneficiaryName, display(transaction.beneficiaryName))}
              ${infoRow(AD1_PRINT_TEXT.accountNumber, display(transaction.beneAccountNumber))}
              ${infoRow(AD1_PRINT_TEXT.bankName, display(transaction.beneBankName))}
              ${infoRow(AD1_PRINT_TEXT.swiftCode, display(transaction.swiftCode))}
              ${infoRow(AD1_PRINT_TEXT.address, display(transaction.beniAddress))}
              ${infoRow(AD1_PRINT_TEXT.product, productName(transaction.productSnapshot))}
              ${infoRow(AD1_PRINT_TEXT.currency, currencyName(transaction.currencySnapshot))}
              ${infoRow(AD1_PRINT_TEXT.purpose, purposeName(transaction.purposeSnapshot))}
            </div>
          </div>

          <div class="section panel">
            <p class="panel-title">${escapeHtml(AD1_PRINT_TEXT.pricing)}</p>
            <div class="info-list">
              ${infoRow(AD1_PRINT_TEXT.dealId, display(transaction.dealId))}
              ${infoRow(AD1_PRINT_TEXT.fcVolume, display(transaction.fcVolume))}
              ${infoRow(AD1_PRINT_TEXT.saleRate, display(transaction.saleRate))}
              ${infoRow(AD1_PRINT_TEXT.totalInr, display(transaction.totalInrAmt))}
              ${infoRow(AD1_PRINT_TEXT.gst, display(transaction.gst))}
              ${infoRow(AD1_PRINT_TEXT.bankCharges, display(transaction.bankCharges))}
              ${infoRow(AD1_PRINT_TEXT.tcs, display(transaction.tcs))}
              ${infoRow(AD1_PRINT_TEXT.otherIncome, display(transaction.otherIncome))}
              ${infoRow(AD1_PRINT_TEXT.finalAmount, display(transaction.finalAmount))}
              ${infoRow(AD1_PRINT_TEXT.settlementRate, display(transaction.settlementRate))}
              ${infoRow(AD1_PRINT_TEXT.grossRevenue, display(transaction.grossRevenue))}
            </div>
          </div>

          <div class="section panel">
            <p class="panel-title">${escapeHtml(AD1_PRINT_TEXT.agent)}</p>
            <div class="info-list">
              ${infoRow(AD1_PRINT_TEXT.agentName, agentName(transaction.agentSnapshot))}
              ${infoRow(AD1_PRINT_TEXT.agentComm, display(transaction.agentComm))}
              ${infoRow(AD1_PRINT_TEXT.tds, display(transaction.tds))}
              ${infoRow(AD1_PRINT_TEXT.commissionPayable, display(transaction.commissionPayable))}
              ${infoRow(AD1_PRINT_TEXT.netRevenue, display(transaction.netRevenue))}
            </div>
          </div>

          <div class="section panel">
            <p class="panel-title">${escapeHtml(AD1_PRINT_TEXT.bank)}</p>
            <div class="info-list">
              ${infoRow(AD1_PRINT_TEXT.bankName, bankName(transaction.bankSnapshot) === '-' ? display(transaction.beneBankName) : bankName(transaction.bankSnapshot))}
              ${infoRow(AD1_PRINT_TEXT.rtgsRef, display(transaction.rtgsImpsNeftRefNo))}
              ${infoRow(AD1_PRINT_TEXT.remarks, display(transaction.remarks))}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
