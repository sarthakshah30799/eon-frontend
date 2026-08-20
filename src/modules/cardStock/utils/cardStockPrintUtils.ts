import type { ICompanyProfile } from '@/modules/companyProfile/types';
import type { IBranchProfile } from '@/modules/branchProfile/types';
import type {
  CardStockPrintCopyType,
  CardStockPrintKind,
  ICardStockReceipt,
  ICardStockReceiptItem,
} from '@/api/cardStock';
import type { CardTransferRequest } from '@/modules/cardTransfer/types';
import { toDisplayDate } from '@/utils';
import {
  CARD_STOCK_PRINT_RATE,
  CARD_STOCK_PRINT_TEXT,
} from '../constants/cardStockConstants';

export type CardStockPrintLine = {
  currency: string;
  product: string;
  kitNumber: string;
  maskedCardNumber: string;
  feAmount: string;
  per: string;
};

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
  if (!value) return '-';
  if (value instanceof Date) {
    return toDisplayDate(value.toISOString().slice(0, 10)) || '-';
  }
  return toDisplayDate(value) || '-';
};

const joinAddress = (...parts: Array<string | null | undefined>) =>
  parts.map(part => part?.trim()).filter(Boolean).join(', ');

const currencyLabel = (snapshot: ICardStockReceiptItem['currencySnapshot']) =>
  snapshot?.currencyCode?.trim() || snapshot?.currencyName?.trim() || '-';

const productLabel = (snapshot: ICardStockReceiptItem['productSnapshot']) =>
  snapshot?.productCode?.trim() || snapshot?.productDescription?.trim() || '-';

const lineAmount = (feAmount: string, per: string) => {
  const fe = Number(feAmount);
  const divisor = Number(per);
  const safePer = Number.isFinite(divisor) && divisor !== 0 ? divisor : 1;
  const amount = (Number.isFinite(fe) ? fe : 0) * CARD_STOCK_PRINT_RATE / safePer;
  return amount;
};

const units = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const convertBelowHundred = (value: number) => {
  if (value < 20) return units[value];
  const ten = Math.floor(value / 10);
  const unit = value % 10;
  return `${tens[ten]}${unit ? ` ${units[unit]}` : ''}`.trim();
};

const convertBelowThousand = (value: number) => {
  if (value < 100) return convertBelowHundred(value);
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return `${units[hundred]} Hundred${rest ? ` ${convertBelowHundred(rest)}` : ''}`.trim();
};

const numberToWords = (input: number) => {
  if (!Number.isFinite(input)) return '';
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

export const getCardStockPrintCopyType = (printCount?: number | null): CardStockPrintCopyType =>
  (printCount ?? 0) === 0 ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';

export const getCardStockPrintCopyLabel = (copyType: CardStockPrintCopyType) =>
  copyType === 'DUPLICATE_COPY'
    ? CARD_STOCK_PRINT_TEXT.duplicateCopy
    : CARD_STOCK_PRINT_TEXT.originalCopy;

export const getCardStockPrintButtonLabel = (
  kind: CardStockPrintKind,
  copyType: CardStockPrintCopyType,
  options?: { transfer?: boolean },
) => {
  const isDuplicate = copyType === 'DUPLICATE_COPY';
  if (!options?.transfer) {
    return isDuplicate ? CARD_STOCK_PRINT_TEXT.printDuplicate : CARD_STOCK_PRINT_TEXT.printOriginal;
  }
  if (kind === 'STOCK_OUT') {
    return isDuplicate
      ? CARD_STOCK_PRINT_TEXT.printStockOutDuplicate
      : CARD_STOCK_PRINT_TEXT.printStockOutOriginal;
  }
  return isDuplicate
    ? CARD_STOCK_PRINT_TEXT.printStockInDuplicate
    : CARD_STOCK_PRINT_TEXT.printStockInOriginal;
};

export const buildReceiptPrintLines = (receipt: ICardStockReceipt): CardStockPrintLine[] =>
  (receipt.items ?? []).flatMap(item =>
    (item.cards ?? []).map(card => ({
      currency: currencyLabel(item.currencySnapshot),
      product: productLabel(item.productSnapshot),
      kitNumber: card.kitNumber || '-',
      maskedCardNumber: card.maskedCardNumber || '-',
      feAmount: card.amount || card.denomination || '0',
      per: item.per || '1',
    })),
  );

export const buildTransferPrintLines = (request: CardTransferRequest): CardStockPrintLine[] =>
  (request.items ?? []).flatMap(item =>
    (item.cards ?? []).map(card => ({
      currency: card.currencyCode || currencyLabel(item.currencySnapshot),
      product: card.productCode || productLabel(item.productSnapshot),
      kitNumber: card.kitNumber || '-',
      maskedCardNumber: card.maskedCardNumber || '-',
      feAmount: card.amount || card.denomination || '0',
      per: item.per || '1',
    })),
  );

export const openCardStockPrintWindow = (html: string) => {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) {
    throw new Error(CARD_STOCK_PRINT_TEXT.popupBlocked);
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onafterprint = () => {
    printWindow.close();
  };
  window.setTimeout(() => {
    printWindow.print();
  }, 250);
};

export const buildCardStockPrintHtml = ({
  kind,
  copyType,
  documentNumber,
  documentDate,
  company,
  branch,
  counterpartName,
  counterpartAddress,
  lines,
}: {
  kind: CardStockPrintKind;
  copyType: CardStockPrintCopyType;
  documentNumber: string;
  documentDate: string | Date;
  company: ICompanyProfile | null;
  branch: IBranchProfile | null;
  counterpartName: string;
  counterpartAddress?: string;
  lines: CardStockPrintLine[];
}) => {
  const title =
    kind === 'STOCK_OUT'
      ? CARD_STOCK_PRINT_TEXT.titleStockOut
      : CARD_STOCK_PRINT_TEXT.titleStockIn;
  const copyLabel = getCardStockPrintCopyLabel(copyType);
  const counterpartTitle =
    kind === 'STOCK_OUT'
      ? CARD_STOCK_PRINT_TEXT.transferredTo
      : CARD_STOCK_PRINT_TEXT.receivedFrom;
  const signLabel =
    kind === 'STOCK_OUT'
      ? CARD_STOCK_PRINT_TEXT.issuedBy
      : CARD_STOCK_PRINT_TEXT.receivedBy;
  const rateLabel = formatAmount(CARD_STOCK_PRINT_RATE);
  const totals = lines.reduce(
    (acc, line) => {
      const fe = Number(line.feAmount);
      acc.fe += Number.isFinite(fe) ? fe : 0;
      acc.amount += lineAmount(line.feAmount, line.per);
      return acc;
    },
    { fe: 0, amount: 0 },
  );
  const itemRows = lines
    .map(
      (line, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(line.currency || '-')}</td>
          <td>${escapeHtml(line.product || '-')}</td>
          <td>${escapeHtml(line.kitNumber || '-')}</td>
          <td>${escapeHtml(line.maskedCardNumber || '-')}</td>
          <td class="right">${escapeHtml(formatAmount(line.feAmount))}</td>
          <td class="right">${escapeHtml(formatAmount(line.per))}</td>
          <td class="right">${escapeHtml(rateLabel)}</td>
          <td class="right">${escapeHtml(formatAmount(lineAmount(line.feAmount, line.per)))}</td>
        </tr>`,
    )
    .join('');
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

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(documentNumber)} - ${escapeHtml(copyLabel)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 24px;
            background: #fff;
          }
          .page { max-width: 1100px; margin: 0 auto; }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .header-center { text-align: center; flex: 1; }
          .header-right { text-align: right; font-weight: 700; white-space: nowrap; }
          .brand { display: flex; gap: 12px; align-items: center; min-width: 240px; }
          .brand img { width: 56px; height: 56px; object-fit: contain; }
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
          .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.08em; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #374151; }
          .meta-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; margin-bottom: 16px; }
          .panel { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px 14px; }
          .panel-title {
            margin: 0 0 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #111827;
          }
          .info-list { display: grid; gap: 4px; font-size: 12px; line-height: 1.4; }
          .info-row { display: flex; gap: 8px; }
          .info-label { min-width: 122px; font-weight: 700; }
          .section { margin-top: 14px; }
          .section h2 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
          th { background: #f8fafc; text-transform: uppercase; font-size: 11px; }
          .right { text-align: right; }
          .footer {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-top: 28px;
            font-size: 12px;
          }
          .sign-box { min-width: 220px; text-align: center; }
          .muted { color: #6b7280; }
          .totals {
            display: grid;
            gap: 4px;
            justify-content: end;
            text-align: right;
            margin-top: 10px;
            font-size: 12px;
          }
          .words { margin-top: 10px; font-style: italic; }
          .copy-mark { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; }
          .nowrap-table th,
          .nowrap-table td { white-space: nowrap; padding: 6px 6px; font-size: 11px; }
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
              <h1>${escapeHtml(title)}</h1>
              <p>${escapeHtml(documentNumber)}</p>
            </div>
            <div class="header-right copy-mark">${escapeHtml(copyLabel)}</div>
          </div>

          <div class="meta-grid">
            <div class="panel">
              <p class="panel-title">${escapeHtml(CARD_STOCK_PRINT_TEXT.companyBranch)}</p>
              <div class="info-list">
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.documentNo)}:</span><span>${escapeHtml(documentNumber || '-')}</span></div>
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.documentDate)}:</span><span>${escapeHtml(formatDate(documentDate))}</span></div>
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.branchGst)}:</span><span>${escapeHtml(branch?.gstNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.panNo)}:</span><span>${escapeHtml(company?.panNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.address)}:</span><span>${escapeHtml(branchAddress || '-')}</span></div>
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.contact)}:</span><span>${escapeHtml(branch?.contactNo || '-')}</span></div>
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.email)}:</span><span>${escapeHtml(branch?.branchEmail || company?.email || '-')}</span></div>
              </div>
            </div>
            <div class="panel">
              <p class="panel-title">${escapeHtml(counterpartTitle)}</p>
              <div class="info-list">
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.name)}:</span><span>${escapeHtml(counterpartName || '-')}</span></div>
                <div class="info-row"><span class="info-label">${escapeHtml(CARD_STOCK_PRINT_TEXT.address)}:</span><span>${escapeHtml(counterpartAddress || '-')}</span></div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>${escapeHtml(CARD_STOCK_PRINT_TEXT.cardDetails)}</h2>
            <table class="nowrap-table">
              <thead>
                <tr>
                  <th>${escapeHtml(CARD_STOCK_PRINT_TEXT.srNo)}</th>
                  <th>${escapeHtml(CARD_STOCK_PRINT_TEXT.currency)}</th>
                  <th>${escapeHtml(CARD_STOCK_PRINT_TEXT.product)}</th>
                  <th>${escapeHtml(CARD_STOCK_PRINT_TEXT.kitNumber)}</th>
                  <th>${escapeHtml(CARD_STOCK_PRINT_TEXT.cardNumber)}</th>
                  <th class="right">${escapeHtml(CARD_STOCK_PRINT_TEXT.feAmount)}</th>
                  <th class="right">${escapeHtml(CARD_STOCK_PRINT_TEXT.per)}</th>
                  <th class="right">${escapeHtml(CARD_STOCK_PRINT_TEXT.rate)}</th>
                  <th class="right">${escapeHtml(CARD_STOCK_PRINT_TEXT.amount)}</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows || `<tr><td colspan="9">${escapeHtml(CARD_STOCK_PRINT_TEXT.noCards)}</td></tr>`}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div><strong>${escapeHtml(CARD_STOCK_PRINT_TEXT.cards)}:</strong> ${lines.length}</div>
            <div><strong>${escapeHtml(CARD_STOCK_PRINT_TEXT.totalFe)}:</strong> ${escapeHtml(formatAmount(totals.fe))}</div>
            <div><strong>${escapeHtml(CARD_STOCK_PRINT_TEXT.totalAmount)}:</strong> ${escapeHtml(formatAmount(totals.amount))}</div>
            <div class="words"><strong>${escapeHtml(CARD_STOCK_PRINT_TEXT.amountInWords)}:</strong> ${escapeHtml(numberToWords(totals.amount))}</div>
          </div>

          <div class="footer">
            <div>
              <div>${escapeHtml(CARD_STOCK_PRINT_TEXT.footerNote)}</div>
              <div class="muted">${escapeHtml(formatDate(documentDate))}</div>
            </div>
            <div class="sign-box">
              <div>${escapeHtml(signLabel)}</div>
              <div style="height: 42px;"></div>
              <div><strong>For ${escapeHtml(company?.name || '')}</strong></div>
              <div>${escapeHtml(CARD_STOCK_PRINT_TEXT.authorizedSignatory)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
