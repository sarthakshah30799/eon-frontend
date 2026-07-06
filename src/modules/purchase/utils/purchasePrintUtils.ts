import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import type { IPurchaseFormValues } from '../types/purchaseTypes';

type PurchasePrintCopyType = 'CUSTOMER_COPY' | 'DUPLICATE_COPY';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatAmount = (value?: string | null) => {
  if (value === undefined || value === null || value === '') {
    return '0.0000';
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(4) : value;
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

const formatReferenceValue = (value?: string | null) => value?.trim() || '-';

const getCustomerCopyLabel = (copyType: PurchasePrintCopyType) =>
  copyType === 'DUPLICATE_COPY' ? 'Duplicate Copy' : 'Original Copy';

export const buildPurchasePrintHtml = ({
  copyType,
  transactionNumber,
  transactionDate,
  company,
  branch,
  transaction,
  sacCode,
}: {
  copyType: PurchasePrintCopyType;
  transactionNumber: string;
  transactionDate: string | Date;
  company: ICompanyProfile | null;
  branch: IBranchProfile | null;
  transaction: IPurchaseFormValues;
  sacCode: string;
}) => {
  const totalAmount = transaction.transactions.reduce((sum, row) => {
    const rowTotal = Number(row.finalAmount || row.total || 0);
    return sum + (Number.isFinite(rowTotal) ? rowTotal : 0);
  }, 0);
  const additionalCharges = transaction.additionalCharges.reduce((sum, row) => {
    const rowTotal = Number(row.totalAmount || row.amount || 0);
    return sum + (Number.isFinite(rowTotal) ? rowTotal : 0);
  }, 0);
  const payableAmount = totalAmount + additionalCharges;
  const amountInWords = numberToWords(payableAmount);

  const itemRows = transaction.transactions
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(row.currencyCode || '-')}</td>
          <td>${escapeHtml(row.productCode || '-')}</td>
          <td class="right">${escapeHtml(formatAmount(row.quantity))}</td>
          <td class="right">${escapeHtml(formatAmount(row.rate))}</td>
          <td class="right">${escapeHtml(formatAmount(row.finalAmount || row.total))}</td>
        </tr>`
    )
    .join('');

  const chargeRows = transaction.additionalCharges
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(row.accountName || formatReferenceValue(row.accountId))}</td>
          <td class="right">${escapeHtml(formatAmount(row.gstAmount))}</td>
          <td class="right">${escapeHtml(formatAmount(row.totalAmount || row.amount))}</td>
        </tr>`
    )
    .join('');

  const paymentRows = transaction.paymentDetails
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml('R/P')}</td>
          <td>${escapeHtml(row.accountName || formatReferenceValue(row.accountId))}</td>
          <td class="right">${escapeHtml(formatAmount(row.amount))}</td>
          <td>${escapeHtml(formatReferenceValue(row.chequeNumber))}</td>
          <td>${escapeHtml(formatDate(row.chequeDate))}</td>
        </tr>`
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
        <title>${escapeHtml(transactionNumber)} - ${escapeHtml(getCustomerCopyLabel(copyType))}</title>
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
          .totals {
            display: grid;
            gap: 4px;
            justify-content: end;
            text-align: right;
            margin-top: 10px;
            font-size: 12px;
          }
          .words {
            margin-top: 10px;
            font-style: italic;
          }
          .copy-mark {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
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
                <div style="font-size: 14px; font-weight: 700;">${escapeHtml(company?.name || 'Maraekat Infotech Ltd')}</div>
                <div class="muted">${escapeHtml(branch?.name || '')}</div>
              </div>
            </div>
            <div class="header-center">
              <h1>BILL OF SUPPLY - PURCHASE</h1>
              <p>${escapeHtml(transactionNumber)}</p>
            </div>
            <div class="header-right copy-mark">${escapeHtml(getCustomerCopyLabel(copyType))}</div>
          </div>

          <div class="meta-grid">
            <div class="panel">
              <p class="panel-title">Company & Branch Information</p>
              <div class="info-list">
                <div class="info-row"><span class="info-label">Branch GST:</span><span>${escapeHtml(branch?.gstNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">SAC Code:</span><span>${escapeHtml(sacCode || '-')}</span></div>
                <div class="info-row"><span class="info-label">Invoice No:</span><span>${escapeHtml(transactionNumber)}</span></div>
                <div class="info-row"><span class="info-label">Invoice Date:</span><span>${escapeHtml(formatDate(transactionDate))}</span></div>
                <div class="info-row"><span class="info-label">RBI Lic No:</span><span>${escapeHtml(company?.aeonLicNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">GST REF No:</span><span>${escapeHtml(branch?.gstNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">PAN No:</span><span>${escapeHtml(company?.panNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">Address:</span><span>${escapeHtml(joinAddress(branch?.address1, branch?.address2, branch?.address3, branch?.city, branch?.gstState, branch?.pinCode))}</span></div>
                <div class="info-row"><span class="info-label">Contact:</span><span>${escapeHtml(branch?.contactNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">Email:</span><span>${escapeHtml(branch?.branchEmail || company?.email || '-')}</span></div>
              </div>
            </div>

            <div class="panel">
              <p class="panel-title">Details of Person Whom the Invoice is Billed</p>
              <div class="info-list">
                <div class="info-row"><span class="info-label">Party Name:</span><span>${escapeHtml(transaction.partyProfileName || '-')}</span></div>
                <div class="info-row"><span class="info-label">PAN:</span><span>${escapeHtml(transaction.partyProfilePanNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">Address:</span><span>${escapeHtml(joinAddress(transaction.partyProfileAddress1, transaction.partyProfileAddress2, transaction.partyProfileAddress3, transaction.partyProfileCity, transaction.partyProfilePinCode))}</span></div>
                <div class="info-row"><span class="info-label">Contact No:</span><span>${escapeHtml(transaction.partyProfilePhoneNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">GSTIN/UIN:</span><span>${escapeHtml(transaction.partyProfileGstNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">State Code:</span><span>${escapeHtml(transaction.partyProfileGstStateName || '-')}</span></div>
                <div class="info-row"><span class="info-label">Manual Bill Ref:</span><span>${escapeHtml(transaction.manualBookNo || transaction.manualBookReferenceType || '-')}</span></div>
                <div class="info-row"><span class="info-label">Place of Supply:</span><span>${escapeHtml(transaction.partyProfileGstStateName || branch?.gstState || '-')}</span></div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Transaction Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Currency</th>
                  <th>EX</th>
                  <th class="right">Quantity</th>
                  <th class="right">Rate</th>
                  <th class="right">Final Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows || '<tr><td colspan="6">No items</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Additional Charges</h2>
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Description</th>
                  <th class="right">GST Amount</th>
                  <th class="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${chargeRows || '<tr><td colspan="4">No additional charges</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div><strong>Total Amount:</strong> ${escapeHtml(formatAmount(payableAmount.toFixed(4)))}</div>
            <div class="words"><strong>Total Amount in Words:</strong> ${escapeHtml(amountInWords)}</div>
          </div>

          <div class="section">
            <h2>Electronic Reference</h2>
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>R/P</th>
                  <th>Bank</th>
                  <th class="right">Amount</th>
                  <th>Cheque Number</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${paymentRows || '<tr><td colspan="6">No payment details</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div>
              <div>Original for Customer and Duplicate for Supplier</div>
              <div class="muted">${escapeHtml(formatDateTime(transactionDate))}</div>
            </div>
            <div class="sign-box">
              <div>Signature of Customer</div>
              <div style="height: 42px;"></div>
              <div><strong>For MARAEKAT INFOTECH LTD</strong></div>
              <div>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getPurchasePrintCopyLabel = (copyType: PurchasePrintCopyType) =>
  getCustomerCopyLabel(copyType);
