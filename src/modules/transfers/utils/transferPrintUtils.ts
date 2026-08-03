import type { ICompanyProfile } from '@/modules/companyProfile/types';
import type { ICurrencyTransfer } from '../types';

type TransferPrintCopyType = 'CUSTOMER_COPY' | 'DUPLICATE_COPY';

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

  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-GB');
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return '-';
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('en-GB');
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

const joinAddress = (...parts: Array<string | null | undefined>) =>
  parts.map(part => part?.trim()).filter(Boolean).join(', ');

const getCopyLabel = (copyType: TransferPrintCopyType) =>
  copyType === 'DUPLICATE_COPY' ? 'Duplicate Copy' : 'Original Copy';

const getBranchDisplay = (branchSnapshot?: Record<string, unknown> | null) => {
  if (!branchSnapshot) {
    return '-';
  }

  const name = String(branchSnapshot.name ?? branchSnapshot.label ?? branchSnapshot.code ?? '').trim();
  const code = String(branchSnapshot.code ?? '').trim();
  const address = joinAddress(
    String(branchSnapshot.address1 ?? '').trim() || null,
    String(branchSnapshot.address2 ?? '').trim() || null,
    String(branchSnapshot.address3 ?? '').trim() || null,
    String(branchSnapshot.city ?? '').trim() || null,
    String(branchSnapshot.pinCode ?? '').trim() || null,
  );

  const heading = [name, code ? `(${code})` : ''].filter(Boolean).join(' ').trim();
  return [heading, address].filter(Boolean).join(', ') || '-';
};

const getCounterDisplay = (
  counterSnapshot?: Record<string, unknown> | null,
  branchSnapshot?: Record<string, unknown> | null,
) => {
  if (!counterSnapshot) {
    return getBranchDisplay(branchSnapshot);
  }

  const counterName = String(counterSnapshot.name ?? counterSnapshot.label ?? counterSnapshot.code ?? '').trim();
  const counterCode = String(counterSnapshot.code ?? '').trim();
  const branchDisplay = getBranchDisplay(branchSnapshot);
  const heading = [counterName, counterCode ? `(${counterCode})` : ''].filter(Boolean).join(' ').trim();
  return [heading, branchDisplay].filter(Boolean).join(', ') || '-';
};

export const buildTransferPrintHtml = ({
  copyType,
  transfer,
  company,
}: {
  copyType: TransferPrintCopyType;
  transfer: ICurrencyTransfer;
  company: ICompanyProfile | null;
}) => {
  const transferDate = transfer.transactionDate ? new Date(transfer.transactionDate) : new Date();
  const transferDateLabel = formatDate(transferDate);
  const destinationLabel = transfer.transferType === 'BRANCH' ? 'Branch' : 'Counter';
  const destinationDisplay =
    transfer.transferType === 'BRANCH'
      ? getBranchDisplay(transfer.destinationBranchSnapshot ?? null)
      : getCounterDisplay(
          transfer.destinationCounterSnapshot ?? null,
          transfer.destinationBranchSnapshot ?? null,
        );
  const sourceDisplay =
    transfer.transferType === 'BRANCH'
      ? getBranchDisplay(transfer.sourceBranchSnapshot ?? null)
      : getCounterDisplay(
          transfer.sourceCounterSnapshot ?? null,
          transfer.sourceBranchSnapshot ?? null,
        );

  const totalAmount = (transfer.items ?? []).reduce((sum, item) => {
    const value = Number(item.finalAmount || item.amount || 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const itemRows = (transfer.items ?? [])
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(String(item.currencySnapshot?.currencyCode ?? item.currencySnapshot?.code ?? item.currencySnapshot?.name ?? item.currencySnapshot?.label ?? '-'))}</td>
          <td>${escapeHtml(String(item.productSnapshot?.code ?? item.productSnapshot?.name ?? item.productSnapshot?.label ?? '-'))}</td>
          <td class="right">${escapeHtml(formatAmount(item.quantity, 7))}</td>
          <td class="right">${escapeHtml(formatAmount(item.rate, 7))}</td>
          <td class="right">${escapeHtml(formatAmount(item.finalAmount || item.amount))}</td>
        </tr>`,
    )
    .join('');

  const logoHtml = company?.logo
    ? `<img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.name)}" />`
    : `<div class="logo-fallback">${escapeHtml(company?.shortCode || company?.name || 'MARAEKAT')}</div>`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(transfer.number || 'Transfer')} - ${escapeHtml(getCopyLabel(copyType))}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .page {
            max-width: 980px;
            margin: 0 auto;
            padding: 24px;
          }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          .logo img {
            max-width: 72px;
            max-height: 72px;
            object-fit: contain;
          }
          .logo-fallback {
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            font-weight: 700;
            font-size: 12px;
            text-align: center;
            padding: 6px;
          }
          .company-block {
            text-align: center;
            margin-top: 8px;
            margin-bottom: 16px;
          }
          .company-title {
            font-size: 18px;
            font-weight: 700;
          }
          .company-subtitle {
            font-size: 13px;
            color: #4b5563;
            margin-top: 3px;
          }
          .copy-mark {
            border: 1px solid #111827;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }
          .title {
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            margin: 14px 0 18px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            font-size: 13px;
            margin-bottom: 14px;
          }
          .info-box {
            font-size: 13px;
            line-height: 1.55;
            margin-bottom: 18px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 8px;
          }
          .table th,
          .table td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            vertical-align: top;
          }
          .table th {
            background: #f3f4f6;
            text-align: left;
            font-weight: 700;
          }
          .right {
            text-align: right;
          }
          .summary {
            display: flex;
            justify-content: flex-end;
            margin-top: 12px;
          }
          .summary-box {
            min-width: 320px;
            border: 1px solid #d1d5db;
            padding: 10px 12px;
            font-size: 13px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 4px;
          }
          .summary-row.total {
            border-top: 1px solid #d1d5db;
            margin-top: 8px;
            padding-top: 8px;
            font-weight: 700;
          }
          .muted {
            color: #6b7280;
          }
          .footer {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            gap: 16px;
            font-size: 12px;
          }
          .signature {
            min-width: 240px;
            text-align: center;
            border-top: 1px solid #111827;
            padding-top: 8px;
          }
          @media print {
            .page {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="logo">${logoHtml}</div>
            <div class="copy-mark">${escapeHtml(getCopyLabel(copyType))}</div>
          </div>

          <div class="company-block">
            <div class="company-title">${escapeHtml(company?.name || '')}</div>
            <div class="company-subtitle">${escapeHtml(sourceDisplay)}</div>
          </div>

          <div class="title">TRANSFER OUT TO BRANCH OR COUNTER</div>

          <div class="meta-row">
            <div><strong>Sr. No.:</strong> ${escapeHtml(transfer.number || '-')}</div>
            <div><strong>Transaction Date:</strong> ${escapeHtml(transferDateLabel)}</div>
          </div>

          <div class="info-box">
            <div>
              We hereby certify that we have transferred the foreign currencies to ${destinationLabel}:
              <strong>${escapeHtml(destinationDisplay)}</strong> as per details below.
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th style="width: 44px;">#</th>
                <th>Currency</th>
                <th>Product</th>
                <th class="right">FE Amount</th>
                <th class="right">Rate / Per</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows || '<tr><td colspan="6">No items</td></tr>'}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-row total">
                <span>Total Amount</span>
                <span>${escapeHtml(formatAmount(totalAmount))}</span>
              </div>
              <div class="summary-row">
                <span>Total Amount in Words</span>
                <span>${escapeHtml(numberToWords(totalAmount))}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div>
              <div class="muted">${escapeHtml(formatDateTime(transferDate))}</div>
            </div>
            <div class="signature">
              <div><strong>For ${escapeHtml(company?.name || '')}</strong></div>
              <div>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getTransferPrintCopyLabel = (copyType: TransferPrintCopyType) =>
  getCopyLabel(copyType);
