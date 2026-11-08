import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import {
  snapshotAddress,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';
import { formatDateTime } from '@/utils';
import { CREDIT_REQUEST_FUND_PRINT_TEXT } from '../constants';
import type {
  CreditRequestFund,
  CreditRequestFundItem,
  CreditRequestFundPrintCopyType,
  CreditRequestFundSnapshot,
} from '../types';

export { openPrintWindow } from '@/modules/transactions/utils/printSnapshotUtils';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatAmount = (value?: string | number | null, decimals = 2) => {
  if (value === undefined || value === null || value === '') {
    return Number(0).toFixed(decimals);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(decimals) : String(value);
};

const formatDate = (value?: string | Date | null) => formatDateTime(value);

const textOrDash = (value?: string | null) => {
  const trimmed = String(value ?? '').trim();
  return trimmed || '-';
};

const snapshotLabel = (snapshot?: CreditRequestFundSnapshot | null) =>
  textOrDash(
    String(snapshot?.name ?? snapshot?.label ?? snapshot?.code ?? '').trim() ||
      null
  );

const snapshotCode = (snapshot?: CreditRequestFundSnapshot | null) =>
  textOrDash(
    String(snapshot?.code ?? snapshot?.value ?? snapshot?.key ?? '').trim() ||
      null
  );

const asPrintBranch = (
  snapshot?: CreditRequestFundSnapshot | null
): IBranchProfile | null => {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }
  return toPrintBranch(snapshot as unknown as IBranchProfile);
};

const metaCell = (label: string, value: string) =>
  `<td class="meta-label">${escapeHtml(label)}</td><td class="meta-value">${escapeHtml(value)}</td>`;

const subLedgerLabel = (item: CreditRequestFundItem) => {
  const party = snapshotCode(item.subledgerPartyProfileSnapshot);
  if (party !== '-') return party;
  return snapshotCode(item.subledgerBranchSnapshot);
};

export const getCreditRequestFundPrintCopyType = (
  printCount?: number | null
): CreditRequestFundPrintCopyType =>
  (printCount ?? 0) === 0 ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';

export const getCreditRequestFundPrintCopyLabel = (
  copyType: CreditRequestFundPrintCopyType
) =>
  copyType === 'DUPLICATE_COPY'
    ? CREDIT_REQUEST_FUND_PRINT_TEXT.duplicateCopy
    : CREDIT_REQUEST_FUND_PRINT_TEXT.originalCopy;

export const buildCreditRequestFundPrintHtml = ({
  copyType,
  record,
  company,
}: {
  copyType: CreditRequestFundPrintCopyType;
  record: CreditRequestFund;
  company: ICompanyProfile | null;
}) => {
  const printCompany = toPrintCompany(company);
  const printBranch = asPrintBranch(record.branchSnapshot);
  const branchAddress = snapshotAddress(printBranch);
  const copyLabel = getCreditRequestFundPrintCopyLabel(copyType);
  const companyName =
    printCompany?.name || CREDIT_REQUEST_FUND_PRINT_TEXT.companyFallback;

  const logoHtml = printCompany?.logo
    ? `<img src="${escapeHtml(printCompany.logo)}" alt="${escapeHtml(companyName)}" />`
    : `<div class="logo-fallback">${escapeHtml(
        printCompany?.shortCode ||
          printCompany?.name ||
          CREDIT_REQUEST_FUND_PRINT_TEXT.logoFallback
      )}</div>`;

  const headerAccount = [
    snapshotCode(record.headerAccountSnapshot),
    snapshotLabel(record.headerAccountSnapshot),
  ]
    .filter(part => part && part !== '-')
    .filter((part, idx, arr) => arr.indexOf(part) === idx)
    .join(' - ');

  const itemRows = (record.items ?? [])
    .slice()
    .sort((a, b) => (a.lineNo ?? 0) - (b.lineNo ?? 0))
    .map((item, index) => {
      const debit =
        item.direction === 'DEBIT' ? formatAmount(item.amount) : formatAmount(0);
      const credit =
        item.direction === 'CREDIT'
          ? formatAmount(item.amount)
          : formatAmount(0);
      return `
        <tr>
          <td class="center">${escapeHtml(String(item.lineNo ?? index + 1))}</td>
          <td>${escapeHtml(snapshotLabel(item.itemTypeSnapshot))}</td>
          <td>${escapeHtml(snapshotCode(item.accountSnapshot))}</td>
          <td>${escapeHtml(snapshotLabel(item.accountSnapshot))}</td>
          <td>${escapeHtml(subLedgerLabel(item))}</td>
          <td class="center">${escapeHtml(item.direction)}</td>
          <td class="right">${escapeHtml(debit)}</td>
          <td class="right">${escapeHtml(credit)}</td>
        </tr>`;
    })
    .join('');

  const linkedRows = [
    [
      CREDIT_REQUEST_FUND_PRINT_TEXT.destinationReceipt,
      snapshotLabel(record.destinationReceiptVoucherSnapshot) !== '-'
        ? snapshotLabel(record.destinationReceiptVoucherSnapshot)
        : textOrDash(record.destinationReceiptVoucherId),
    ],
    [
      CREDIT_REQUEST_FUND_PRINT_TEXT.requestingReceipt,
      snapshotLabel(record.requestingReceiptVoucherSnapshot) !== '-'
        ? snapshotLabel(record.requestingReceiptVoucherSnapshot)
        : textOrDash(record.requestingReceiptVoucherId),
    ],
    [
      CREDIT_REQUEST_FUND_PRINT_TEXT.requestingPayment,
      snapshotLabel(record.requestingPaymentVoucherSnapshot) !== '-'
        ? snapshotLabel(record.requestingPaymentVoucherSnapshot)
        : textOrDash(record.requestingPaymentVoucherId),
    ],
  ]
    .map(
      ([label, value]) =>
        `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`
    )
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(record.number)} - ${escapeHtml(copyLabel)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 20px;
            background: #fff;
          }
          .page {
            max-width: 1100px;
            margin: 0 auto;
            border: 1px solid #111827;
            padding: 16px;
          }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .brand {
            display: flex;
            gap: 12px;
            align-items: center;
            min-width: 240px;
          }
          .brand img {
            width: 56px;
            height: 56px;
            object-fit: contain;
          }
          .logo-fallback {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #111827;
            color: white;
            font-size: 11px;
            font-weight: 700;
            border-radius: 8px;
            padding: 4px;
            text-align: center;
          }
          .header-center {
            text-align: center;
            flex: 1;
          }
          .header-center h1 {
            margin: 0;
            font-size: 18px;
            letter-spacing: 0.06em;
          }
          .header-center p {
            margin: 4px 0 0;
            font-size: 12px;
            color: #374151;
          }
          .header-right {
            min-width: 240px;
            text-align: right;
            font-size: 12px;
            line-height: 1.45;
          }
          .copy-mark {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 6px;
          }
          .muted { color: #6b7280; }
          .doc-meta {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 12px;
          }
          .doc-meta td {
            border: 1px solid #111827;
            padding: 6px 8px;
            vertical-align: top;
          }
          .meta-label {
            font-weight: 700;
            width: 16%;
            white-space: nowrap;
            background: #f8fafc;
          }
          .meta-value { width: 34%; }
          table.items {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 12px;
          }
          table.items th,
          table.items td {
            border: 1px solid #111827;
            padding: 5px 6px;
            vertical-align: top;
          }
          table.items th {
            background: #f8fafc;
            text-transform: uppercase;
            font-size: 10px;
            white-space: nowrap;
          }
          .right { text-align: right; }
          .center { text-align: center; }
          .totals {
            display: flex;
            justify-content: flex-end;
            gap: 18px;
            margin-bottom: 12px;
            font-size: 12px;
            font-weight: 700;
          }
          .linked {
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-top: 36px;
          }
          .sign-box {
            text-align: center;
            font-size: 12px;
          }
          .sign-line {
            border-top: 1px solid #111827;
            margin: 0 8px 8px;
            height: 40px;
          }
          @media print {
            body { padding: 0; }
            .page { max-width: none; border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              ${logoHtml}
              <div>
                <div style="font-size: 14px; font-weight: 700;">${escapeHtml(companyName)}</div>
                <div class="muted">${escapeHtml(printBranch?.name || '')}</div>
              </div>
            </div>
            <div class="header-center">
              <h1>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.title)}</h1>
              <p>${escapeHtml(record.number)}</p>
            </div>
            <div class="header-right">
              <div class="copy-mark">${escapeHtml(copyLabel)}</div>
              <div><strong>${escapeHtml(companyName)}</strong></div>
              <div>${escapeHtml(branchAddress || '-')}</div>
              <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.rbiLicNo)}: ${escapeHtml(
                printCompany?.aeonLicNo || '-'
              )}</div>
            </div>
          </div>

          <table class="doc-meta">
            <tr>
              ${metaCell(CREDIT_REQUEST_FUND_PRINT_TEXT.documentNo, record.number)}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.date,
                formatDate(record.transactionDate)
              )}
            </tr>
            <tr>
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.branch,
                snapshotLabel(record.branchSnapshot)
              )}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.destinationBranch,
                snapshotLabel(record.destinationBranchSnapshot)
              )}
            </tr>
            <tr>
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.party,
                snapshotLabel(record.partyProfileSnapshot)
              )}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.entityType,
                snapshotLabel(record.entityTypeSnapshot)
              )}
            </tr>
            <tr>
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.accountType,
                snapshotLabel(record.accountTypeSnapshot)
              )}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.headerAccount,
                textOrDash(headerAccount)
              )}
            </tr>
            <tr>
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.accountMode,
                textOrDash(record.accountMode)
              )}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.paymentMethod,
                textOrDash(record.paymentMethod)
              )}
            </tr>
            <tr>
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.chequeNumber,
                textOrDash(record.chequeNumber)
              )}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.chequeDate,
                formatDate(record.chequeDate)
              )}
            </tr>
            <tr>
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.paidByPan,
                textOrDash(record.paidByPanNumber)
              )}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.paidByName,
                textOrDash(record.paidByPanName)
              )}
            </tr>
            <tr>
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.travelerName,
                textOrDash(record.travelerPanName)
              )}
              ${metaCell(
                CREDIT_REQUEST_FUND_PRINT_TEXT.approvedDate,
                formatDate(record.approvedTransactionDate)
              )}
            </tr>
            <tr>
              <td class="meta-label">${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.narration)}</td>
              <td class="meta-value" colspan="3">${escapeHtml(textOrDash(record.narration))}</td>
            </tr>
          </table>

          <table class="items">
            <thead>
              <tr>
                <th>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.srNo)}</th>
                <th>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.itemType)}</th>
                <th>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.accountCode)}</th>
                <th>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.accountName)}</th>
                <th>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.subLedger)}</th>
                <th>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.direction)}</th>
                <th class="right">${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.totalDebit)}</th>
                <th class="right">${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.totalCredit)}</th>
              </tr>
            </thead>
            <tbody>
              ${
                itemRows ||
                `<tr><td colspan="8">${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.noItems)}</td></tr>`
              }
            </tbody>
          </table>

          <div class="totals">
            <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.totalDebit)}: ${escapeHtml(formatAmount(record.totalDebit))}</div>
            <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.totalCredit)}: ${escapeHtml(formatAmount(record.totalCredit))}</div>
            <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.finalAmount)}: ${escapeHtml(formatAmount(record.finalAmount))}</div>
          </div>

          <div class="linked">
            <strong>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.linkedVouchers)}</strong>
            ${linkedRows}
          </div>

          <div class="signatures">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.preparedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.checkedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.approvedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(CREDIT_REQUEST_FUND_PRINT_TEXT.signature)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
