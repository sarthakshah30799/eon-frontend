import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import { formatTransactionPaymentMethodLabel } from '@/modules/transactions';
import {
  snapshotAddress,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';
import { toDisplayDate } from '@/utils';
import { VOUCHER_LABELS, VOUCHER_PRINT_TEXT } from './constants';
import type { AccountingVoucher, VoucherType } from './types';

export type VoucherPrintCopyType = 'CUSTOMER_COPY' | 'DUPLICATE_COPY';

const PRINTABLE_VOUCHER_TYPES: VoucherType[] = [
  'RECEIPT',
  'PAYMENT',
  'JOURNAL',
];

export const isVoucherPrintableType = (type: VoucherType) =>
  PRINTABLE_VOUCHER_TYPES.includes(type);

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

const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return '-';
  }

  if (value instanceof Date) {
    return toDisplayDate(value.toISOString().slice(0, 10)) || '-';
  }

  return toDisplayDate(value) || '-';
};

const units = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

const convertBelowHundred = (value: number) => {
  if (value < 20) {
    return units[value];
  }

  const ten = Math.floor(value / 10);
  const unit = value % 10;
  return `${tens[ten]}${unit ? ` ${units[unit]}` : ''}`.trim();
};

const convertBelowThousand = (value: number) => {
  if (value < 100) {
    return convertBelowHundred(value);
  }

  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return `${units[hundred]} Hundred${rest ? ` ${convertBelowHundred(rest)}` : ''}`.trim();
};

const numberToWords = (input: number) => {
  if (!Number.isFinite(input)) {
    return '';
  }

  const positive = Math.abs(input);
  const rupees = Math.floor(positive);
  const paise = Math.round((positive - rupees) * 100);

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  const segments: string[] = [];

  if (crore) segments.push(`${convertBelowThousand(crore)} Crore`);
  if (lakh) segments.push(`${convertBelowThousand(lakh)} Lakh`);
  if (thousand) segments.push(`${convertBelowThousand(thousand)} Thousand`);
  if (remainder) segments.push(convertBelowThousand(remainder));
  if (!segments.length) segments.push('Zero');

  const paiseText = paise ? ` and ${convertBelowHundred(paise)} Paise` : '';
  return `${segments.join(' ')} Rupees${paiseText}`.replace(/\s+/g, ' ').trim();
};

const snapshotName = (
  snapshot?: AccountingVoucher['partyProfileSnapshot'] | null
) =>
  String(snapshot?.name ?? snapshot?.label ?? snapshot?.code ?? '').trim() ||
  '-';

const snapshotCode = (
  snapshot?: AccountingVoucher['headerAccountSnapshot'] | null
) => String(snapshot?.code ?? snapshot?.key ?? '').trim() || '-';

const settledBillNumber = (
  snapshot?: AccountingVoucher['items'][number]['settledTransactionSnapshot']
) => {
  if (!snapshot || typeof snapshot !== 'object') {
    return '-';
  }

  const record = snapshot as {
    number?: string;
    code?: string;
    name?: string;
    label?: string;
  };
  return (
    String(record.number ?? record.code ?? record.name ?? record.label ?? '')
      .trim() || '-'
  );
};

const infoRow = (label: string, value: string) =>
  `<div class="info-row"><span class="info-label">${escapeHtml(label)}:</span><span>${escapeHtml(value)}</span></div>`;

const asPrintBranch = (
  snapshot: AccountingVoucher['branchSnapshot']
): IBranchProfile | null => {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }

  return toPrintBranch(snapshot as unknown as IBranchProfile);
};

export const getVoucherPrintCopyType = (
  printCount?: number | null
): VoucherPrintCopyType =>
  (printCount ?? 0) === 0 ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';

export const getVoucherPrintCopyLabel = (copyType: VoucherPrintCopyType) =>
  copyType === 'DUPLICATE_COPY'
    ? VOUCHER_PRINT_TEXT.duplicateCopy
    : VOUCHER_PRINT_TEXT.originalCopy;

export const buildVoucherPrintHtml = ({
  copyType,
  voucher,
  company,
}: {
  copyType: VoucherPrintCopyType;
  voucher: AccountingVoucher;
  company: ICompanyProfile | null;
}) => {
  const printCompany = toPrintCompany(company);
  const printBranch = asPrintBranch(voucher.branchSnapshot);
  const branchAddress = snapshotAddress(printBranch);
  const voucherTitle = `${VOUCHER_LABELS[voucher.voucherType]} Voucher`.toUpperCase();
  const copyLabel = getVoucherPrintCopyLabel(copyType);
  const amountValue = Number(voucher.finalAmount || 0);
  const amountInWords = numberToWords(
    Number.isFinite(amountValue) ? amountValue : 0
  );
  const partyName = snapshotName(voucher.partyProfileSnapshot);
  const headerAccountLabel = [
    snapshotCode(voucher.headerAccountSnapshot),
    snapshotName(voucher.headerAccountSnapshot),
  ]
    .filter(part => part && part !== '-')
    .join(' - ');
  const paymentMethodLabel =
    formatTransactionPaymentMethodLabel(voucher.paymentMethod) ||
    voucher.accountMode ||
    '-';
  const isPartyVoucher =
    voucher.voucherType === 'RECEIPT' || voucher.voucherType === 'PAYMENT';
  const partyLabel =
    voucher.voucherType === 'PAYMENT'
      ? VOUCHER_PRINT_TEXT.paidTo
      : VOUCHER_PRINT_TEXT.receivedFrom;

  const itemRows = (voucher.items ?? [])
    .map(item => {
      const debit =
        item.direction === 'DEBIT' ? formatAmount(item.amount) : formatAmount(0);
      const credit =
        item.direction === 'CREDIT'
          ? formatAmount(item.amount)
          : formatAmount(0);
      const particulars =
        String(
          item.accountSnapshot?.name ??
            item.accountSnapshot?.label ??
            item.itemTypeSnapshot?.name ??
            item.itemTypeSnapshot?.label ??
            ''
        ).trim() || '-';

      return `
        <tr>
          <td>${escapeHtml(settledBillNumber(item.settledTransactionSnapshot))}</td>
          <td>${escapeHtml(snapshotCode(item.accountSnapshot))}</td>
          <td>${escapeHtml(formatDate(voucher.transactionDate))}</td>
          <td>${escapeHtml(snapshotCode(item.subledgerPartyProfileSnapshot))}</td>
          <td>${escapeHtml(particulars)}</td>
          <td class="right">${escapeHtml(debit)}</td>
          <td class="right">${escapeHtml(credit)}</td>
        </tr>`;
    })
    .join('');

  const logoHtml = printCompany?.logo
    ? `<img src="${escapeHtml(printCompany.logo)}" alt="${escapeHtml(printCompany.name)}" />`
    : `<div class="logo-fallback">${escapeHtml(printCompany?.shortCode || printCompany?.name || 'MARAEKAT')}</div>`;

  const partySummary = isPartyVoucher
    ? `
          <div class="panel">
            <p class="panel-title">${escapeHtml(partyLabel)}</p>
            <div class="info-list">
              ${infoRow(partyLabel, partyName)}
              ${infoRow(
                VOUCHER_PRINT_TEXT.sumOfAmount,
                `${formatAmount(voucher.finalAmount)} [ ${amountInWords} ]`
              )}
              ${infoRow(
                VOUCHER_PRINT_TEXT.paymentDetails,
                `${paymentMethodLabel}${headerAccountLabel ? ` [ ${headerAccountLabel} ]` : ''}`
              )}
              ${infoRow(
                VOUCHER_PRINT_TEXT.chequeNumber,
                voucher.chequeNumber?.trim() || '-'
              )}
              ${infoRow(VOUCHER_PRINT_TEXT.chequeDate, formatDate(voucher.chequeDate))}
              ${infoRow(VOUCHER_PRINT_TEXT.drawnOn, voucher.drawnOn?.trim() || '-')}
              ${infoRow(
                VOUCHER_PRINT_TEXT.panNumber,
                voucher.panNumber?.trim() || '-'
              )}
            </div>
          </div>`
    : `
          <div class="panel">
            <p class="panel-title">${escapeHtml(VOUCHER_PRINT_TEXT.sumOfAmount)}</p>
            <div class="info-list">
              ${infoRow(
                VOUCHER_PRINT_TEXT.sumOfAmount,
                `${formatAmount(voucher.finalAmount)} [ ${amountInWords} ]`
              )}
            </div>
          </div>`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(voucher.number)} - ${escapeHtml(copyLabel)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 24px;
            background: #fff;
          }
          .page {
            max-width: 1100px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .header-center {
            text-align: center;
            flex: 1;
          }
          .header-right {
            text-align: right;
            font-weight: 700;
            white-space: nowrap;
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
            font-size: 12px;
            font-weight: 700;
            border-radius: 8px;
            padding: 4px;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
            letter-spacing: 0.08em;
          }
          .header p {
            margin: 4px 0 0;
            font-size: 12px;
            color: #374151;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1.15fr 1fr;
            gap: 14px;
            margin-bottom: 16px;
          }
          .panel {
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 12px 14px;
          }
          .panel-title {
            margin: 0 0 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #111827;
          }
          .info-list {
            display: grid;
            gap: 4px;
            font-size: 12px;
            line-height: 1.4;
          }
          .info-row {
            display: flex;
            gap: 8px;
          }
          .info-label {
            min-width: 122px;
            font-weight: 700;
          }
          .section {
            margin-top: 14px;
          }
          .section h2 {
            margin: 0 0 8px;
            font-size: 14px;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            vertical-align: top;
          }
          th {
            background: #f8fafc;
            text-transform: uppercase;
            font-size: 11px;
          }
          .right {
            text-align: right;
          }
          .totals {
            display: grid;
            gap: 4px;
            justify-content: end;
            text-align: right;
            margin-top: 10px;
            font-size: 13px;
          }
          .words {
            font-size: 12px;
            color: #374151;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-top: 28px;
            font-size: 12px;
          }
          .sign-box {
            min-width: 220px;
            text-align: center;
          }
          .muted {
            color: #6b7280;
          }
          @media print {
            body { padding: 0; }
            .page { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              ${logoHtml}
              <div>
                <strong>${escapeHtml(printCompany?.name || '-')}</strong>
                <p>${escapeHtml(printBranch?.name || snapshotName(voucher.branchSnapshot))}</p>
              </div>
            </div>
            <div class="header-center">
              <h1>${escapeHtml(voucherTitle)}</h1>
              <p>${escapeHtml(copyLabel)}</p>
            </div>
            <div class="header-right">
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.voucherNo)}: ${escapeHtml(voucher.number)}</div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.date)}: ${escapeHtml(formatDate(voucher.transactionDate))}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="panel">
              <p class="panel-title">${escapeHtml(VOUCHER_PRINT_TEXT.companyBranch)}</p>
              <div class="info-list">
                ${infoRow(VOUCHER_PRINT_TEXT.branchGst, printBranch?.gstNo || '-')}
                ${infoRow(VOUCHER_PRINT_TEXT.rbiLicNo, printCompany?.aeonLicNo || '-')}
                ${infoRow(VOUCHER_PRINT_TEXT.companyPan, printCompany?.panNo || '-')}
                ${infoRow(VOUCHER_PRINT_TEXT.address, branchAddress || '-')}
                ${infoRow(VOUCHER_PRINT_TEXT.contact, printBranch?.contactNo || '-')}
                ${infoRow(
                  VOUCHER_PRINT_TEXT.email,
                  printBranch?.branchEmail || printCompany?.email || '-'
                )}
              </div>
            </div>
            ${partySummary}
          </div>

          <div class="section">
            <h2>${escapeHtml(VOUCHER_LABELS[voucher.voucherType])} Details</h2>
            <table>
              <thead>
                <tr>
                  <th>${escapeHtml(VOUCHER_PRINT_TEXT.billNo)}</th>
                  <th>${escapeHtml(VOUCHER_PRINT_TEXT.accountCode)}</th>
                  <th>${escapeHtml(VOUCHER_PRINT_TEXT.docDate)}</th>
                  <th>${escapeHtml(VOUCHER_PRINT_TEXT.subLedger)}</th>
                  <th>${escapeHtml(VOUCHER_PRINT_TEXT.particulars)}</th>
                  <th class="right">${escapeHtml(VOUCHER_PRINT_TEXT.debit)}</th>
                  <th class="right">${escapeHtml(VOUCHER_PRINT_TEXT.credit)}</th>
                </tr>
              </thead>
              <tbody>
                ${
                  itemRows ||
                  `<tr><td colspan="7">${escapeHtml(VOUCHER_PRINT_TEXT.noItems)}</td></tr>`
                }
                <tr>
                  <td colspan="5"><strong>${escapeHtml(VOUCHER_PRINT_TEXT.total)}</strong></td>
                  <td class="right"><strong>${escapeHtml(formatAmount(voucher.totalDebit))}</strong></td>
                  <td class="right"><strong>${escapeHtml(formatAmount(voucher.totalCredit))}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="info-list">
              ${infoRow(
                VOUCHER_PRINT_TEXT.narration,
                voucher.narration?.trim() || '-'
              )}
            </div>
          </div>

          <div class="totals">
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.sumOfAmount)}:</strong> ${escapeHtml(formatAmount(voucher.finalAmount))}</div>
            <div class="words"><strong>${escapeHtml(amountInWords)}</strong></div>
          </div>

          <div class="footer">
            <div>
              <div>${escapeHtml(copyLabel)}</div>
              <div class="muted">${escapeHtml(formatDate(voucher.transactionDate))}</div>
            </div>
            <div class="sign-box">
              <div style="height: 42px;"></div>
              <div><strong>For ${escapeHtml(printCompany?.name || '')}</strong></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.authorizedSignatory)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
