import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import { formatTransactionPaymentMethodLabel } from '@/modules/transactions';
import {
  snapshotAddress,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';
import { formatDateTime } from '@/utils';
import { VOUCHER_LABELS, VOUCHER_PRINT_TEXT } from './constants';
import type { AccountingVoucher, VoucherType } from './types';

export type VoucherPrintCopyType = 'CUSTOMER_COPY' | 'DUPLICATE_COPY';

const PRINTABLE_VOUCHER_TYPES: VoucherType[] = [
  'RECEIPT',
  'PAYMENT',
  'JOURNAL',
  'DEPOSIT_WITHDRAWAL',
  'ADVICE',
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

const formatDate = (value?: string | Date | null) => formatDateTime(value);

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

export const getVoucherPrintCopyLabel = (copyType: VoucherPrintCopyType) =>
  copyType === 'DUPLICATE_COPY'
    ? VOUCHER_PRINT_TEXT.duplicateCopy
    : VOUCHER_PRINT_TEXT.originalCopy;

const paymentRefLine = (voucher: AccountingVoucher) => {
  const chequeNumber = voucher.chequeNumber?.trim() || '-';
  const chequeDate = formatDate(voucher.chequeDate);
  return `Cheque / Payin Slip No. ${chequeNumber}, dated: ${chequeDate}`;
};

const itemLineNo = (item: AccountingVoucher['items'][number], index: number) => {
  const withLineNo = item as AccountingVoucher['items'][number] & {
    lineNo?: number;
  };
  return Number(withLineNo.lineNo ?? item.lineNumber ?? index + 1);
};

const settledInvoiceNumber = (
  snapshot?: AccountingVoucher['items'][number]['settledTransactionSnapshot']
) => {
  if (!snapshot || typeof snapshot !== 'object') {
    return '';
  }
  const record = snapshot as {
    number?: string;
    code?: string;
    name?: string;
    label?: string;
    transactionType?: string;
    slug?: string;
  };
  return String(
    record.number ?? record.code ?? record.name ?? record.label ?? ''
  ).trim();
};

const settledTransactionKind = (
  snapshot?: AccountingVoucher['items'][number]['settledTransactionSnapshot']
): 'SALE' | 'PURCHASE' | null => {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }
  const record = snapshot as {
    transactionType?: string;
    slug?: string;
  };
  const type = String(record.transactionType ?? '').toUpperCase();
  const slug = String(record.slug ?? '').toUpperCase();
  if (type === 'SALE' || slug.startsWith('SALE')) {
    return 'SALE';
  }
  if (type === 'PURCHASE' || slug.startsWith('PURCHASE')) {
    return 'PURCHASE';
  }
  return null;
};

const advicePurposeLabel = (voucher: AccountingVoucher) => {
  if (voucher.adviceRole === 'ISSUER') {
    return 'ISSUE';
  }
  if (voucher.adviceRole === 'HONOUR') {
    return 'HONOUR';
  }
  return '-';
};

const adviceSumLabel = (voucher: AccountingVoucher) => {
  const amount = formatAmount(voucher.finalAmount);
  const direction = String(voucher.headerDirection ?? '').toUpperCase();
  const marker =
    direction === 'CREDIT' ? 'C' : direction === 'DEBIT' ? 'D' : '';
  const plain = String(Number(voucher.finalAmount || 0) || 0);
  return marker ? `${amount} ${marker} ${plain}` : `${amount} ${plain}`;
};

const passengerOrCompanyName = (
  item: AccountingVoucher['items'][number],
  voucher: AccountingVoucher
) => {
  const settled = item.settledTransactionSnapshot as
    | {
        passengerSnapshot?: {
          name?: string;
          label?: string;
          passengerName?: string;
          fullName?: string;
        } | null;
        partyProfileSnapshot?: {
          name?: string;
          label?: string;
          code?: string;
        } | null;
      }
    | null
    | undefined;
  const passenger = settled?.passengerSnapshot;
  const fromPassenger = String(
    passenger?.name ??
      passenger?.label ??
      passenger?.passengerName ??
      passenger?.fullName ??
      ''
  ).trim();
  if (fromPassenger) {
    return fromPassenger;
  }
  const fromSettledParty = String(
    settled?.partyProfileSnapshot?.name ??
      settled?.partyProfileSnapshot?.label ??
      ''
  ).trim();
  if (fromSettledParty) {
    return fromSettledParty;
  }
  return (
    String(voucher.panName ?? '').trim() ||
    snapshotName(voucher.partyProfileSnapshot)
  );
};

const buildAdvicePrintHtml = ({
  copyType,
  voucher,
  company,
  preparedByName,
}: {
  copyType: VoucherPrintCopyType;
  voucher: AccountingVoucher;
  company: ICompanyProfile | null;
  preparedByName?: string | null;
}) => {
  const printCompany = toPrintCompany(company);
  const printBranch = asPrintBranch(voucher.branchSnapshot);
  const branchAddress = snapshotAddress(printBranch);
  const copyLabel = getVoucherPrintCopyLabel(copyType);
  const companyName =
    printCompany?.name || VOUCHER_PRINT_TEXT.companyFallback;
  const logoHtml = printCompany?.logo
    ? `<img src="${escapeHtml(printCompany.logo)}" alt="${escapeHtml(companyName)}" />`
    : `<div class="logo-fallback">${escapeHtml(
        printCompany?.shortCode ||
          printCompany?.name ||
          VOUCHER_PRINT_TEXT.logoFallback
      )}</div>`;

  const branchLabel = [
    printBranch?.code || snapshotCode(voucher.branchSnapshot),
    printBranch?.name || snapshotName(voucher.branchSnapshot),
  ]
    .filter(part => part && part !== '-')
    .join('-');

  const itemRows = (voucher.items ?? [])
    .slice()
    .sort((a, b) => itemLineNo(a, 0) - itemLineNo(b, 0))
    .map(item => {
      const debit =
        item.direction === 'DEBIT' ? formatAmount(item.amount) : formatAmount(0);
      const credit =
        item.direction === 'CREDIT'
          ? formatAmount(item.amount)
          : formatAmount(0);
      const invoiceNo = settledInvoiceNumber(item.settledTransactionSnapshot);
      const kind = settledTransactionKind(item.settledTransactionSnapshot);
      const sellInv = kind === 'SALE' ? invoiceNo : kind == null ? invoiceNo : '';
      const buyInv = kind === 'PURCHASE' ? invoiceNo : '';
      const subLedger = snapshotCode(
        item.subledgerPartyProfileSnapshot ?? item.subledgerBranchSnapshot
      );
      const accountCode = [
        snapshotCode(item.accountSnapshot),
        item.accountCode,
      ]
        .map(part => String(part ?? '').trim())
        .filter(part => part && part !== '-')
        .filter((part, idx, arr) => arr.indexOf(part) === idx)
        .join(' ');

      return `
        <tr>
          <td>${escapeHtml(sellInv || '-')}</td>
          <td>${escapeHtml(buyInv || '-')}</td>
          <td>${escapeHtml(accountCode || '-')}</td>
          <td>${escapeHtml(subLedger)}</td>
          <td>${escapeHtml(passengerOrCompanyName(item, voucher))}</td>
          <td>${escapeHtml(formatDate(voucher.transactionDate))}</td>
          <td class="right">${escapeHtml(debit)}</td>
          <td class="right">${escapeHtml(credit)}</td>
        </tr>`;
    })
    .join('');

  const preparedName =
    String(preparedByName ?? voucher.panName ?? '').trim() || '';

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
            margin-bottom: 14px;
          }
          .brand {
            display: flex;
            gap: 12px;
            align-items: center;
            min-width: 220px;
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
            min-width: 220px;
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
          .meta {
            font-size: 12px;
            line-height: 1.65;
            margin-bottom: 14px;
          }
          .meta strong {
            display: inline-block;
            min-width: 190px;
          }
          table.items {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 8px;
          }
          table.items th,
          table.items td {
            border-top: 1px solid #111827;
            border-bottom: 1px solid #111827;
            padding: 6px 6px;
            vertical-align: top;
          }
          table.items th {
            text-transform: uppercase;
            font-size: 10px;
            text-align: left;
            white-space: nowrap;
          }
          .right { text-align: right; }
          .totals td {
            font-weight: 700;
            border-top: 1px solid #111827;
            border-bottom: 3px double #111827;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-top: 40px;
          }
          .sign-box {
            text-align: center;
            font-size: 12px;
          }
          .sign-name {
            min-height: 18px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .sign-line {
            border-top: 1px solid #111827;
            margin: 0 8px 8px;
            height: 28px;
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
              <h1>${escapeHtml(VOUCHER_PRINT_TEXT.adviceTitle)}</h1>
              <p>${escapeHtml(voucher.number)}</p>
            </div>
            <div class="header-right">
              <div class="copy-mark">${escapeHtml(copyLabel)}</div>
              <div><strong>${escapeHtml(companyName)}</strong></div>
              <div>${escapeHtml(branchAddress || '-')}</div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.rbiLicNo)}: ${escapeHtml(
                printCompany?.aeonLicNo || '-'
              )}</div>
            </div>
          </div>

          <div class="meta">
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.voucherNo)}:</strong> ${escapeHtml(voucher.number)}</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.date)}:</strong> ${escapeHtml(formatDate(voucher.transactionDate))}</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.branch)}:</strong> ${escapeHtml(branchLabel || '-')}</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.adviceOfDebitCreditNo)}:</strong> -</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.purpose)}:</strong> ${escapeHtml(advicePurposeLabel(voucher))}</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.theSumOfAmount)}:</strong> ${escapeHtml(adviceSumLabel(voucher))}</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.narration)}:</strong> ${escapeHtml(voucher.narration?.trim() || '-')}</div>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.sellInvNo)}</th>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.buyInvNo)}</th>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.accountCode)}</th>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.adviceSubLedger)}</th>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.passengerCompanyName)}</th>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.docDate)}</th>
                <th class="right">${escapeHtml(VOUCHER_PRINT_TEXT.debit)}</th>
                <th class="right">${escapeHtml(VOUCHER_PRINT_TEXT.credit)}</th>
              </tr>
            </thead>
            <tbody>
              ${
                itemRows ||
                `<tr><td colspan="8">${escapeHtml(VOUCHER_PRINT_TEXT.noItems)}</td></tr>`
              }
              <tr class="totals">
                <td colspan="5"><strong>${escapeHtml(VOUCHER_PRINT_TEXT.grandTotal)}</strong></td>
                <td></td>
                <td class="right">${escapeHtml(formatAmount(voucher.totalDebit))}</td>
                <td class="right">${escapeHtml(formatAmount(voucher.totalCredit))}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sign-box">
              <div class="sign-name">${escapeHtml(preparedName)}</div>
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.preparedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-name"></div>
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.checkedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-name"></div>
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.approvedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-name"></div>
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.signature)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const buildDepositWithdrawalPrintHtml = ({
  copyType,
  voucher,
  company,
  preparedByName,
}: {
  copyType: VoucherPrintCopyType;
  voucher: AccountingVoucher;
  company: ICompanyProfile | null;
  preparedByName?: string | null;
}) => {
  const printCompany = toPrintCompany(company);
  const printBranch = asPrintBranch(voucher.branchSnapshot);
  const branchAddress = snapshotAddress(printBranch);
  const copyLabel = getVoucherPrintCopyLabel(copyType);
  const companyName =
    printCompany?.name || VOUCHER_PRINT_TEXT.companyFallback;
  const logoHtml = printCompany?.logo
    ? `<img src="${escapeHtml(printCompany.logo)}" alt="${escapeHtml(companyName)}" />`
    : `<div class="logo-fallback">${escapeHtml(
        printCompany?.shortCode ||
          printCompany?.name ||
          VOUCHER_PRINT_TEXT.logoFallback
      )}</div>`;

  const itemRows = (voucher.items ?? [])
    .slice()
    .sort((a, b) => itemLineNo(a, 0) - itemLineNo(b, 0))
    .map(item => {
      const debit =
        item.direction === 'DEBIT' ? formatAmount(item.amount) : formatAmount(0);
      const credit =
        item.direction === 'CREDIT'
          ? formatAmount(item.amount)
          : formatAmount(0);
      const accountName =
        String(
          item.accountSnapshot?.name ?? item.accountSnapshot?.label ?? ''
        ).trim() || '-';

      return `
        <tr>
          <td>${escapeHtml(snapshotCode(item.accountSnapshot))}</td>
          <td>${escapeHtml(accountName)}</td>
          <td class="right">${escapeHtml(debit)}</td>
          <td class="right">${escapeHtml(credit)}</td>
        </tr>`;
    })
    .join('');

  const preparedName =
    String(preparedByName ?? voucher.panName ?? '').trim() || '';

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
            padding: 20px;
            background: #fff;
          }
          .page {
            max-width: 900px;
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
            margin-bottom: 14px;
          }
          .brand {
            display: flex;
            gap: 12px;
            align-items: center;
            min-width: 220px;
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
            min-width: 220px;
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
          .meta {
            font-size: 12px;
            line-height: 1.6;
            margin-bottom: 14px;
          }
          .meta strong { display: inline-block; min-width: 110px; }
          table.items {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 8px;
          }
          table.items th,
          table.items td {
            border-top: 1px solid #111827;
            border-bottom: 1px solid #111827;
            padding: 6px 8px;
            vertical-align: top;
          }
          table.items th {
            text-transform: uppercase;
            font-size: 11px;
            text-align: left;
          }
          .right { text-align: right; }
          .totals td {
            font-weight: 700;
            border-top: 1px solid #111827;
            border-bottom: 3px double #111827;
          }
          .narration {
            margin-top: 16px;
            font-size: 12px;
            line-height: 1.5;
          }
          .prepared-name {
            margin-top: 10px;
            font-size: 12px;
            font-weight: 700;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-top: 40px;
          }
          .sign-box {
            text-align: center;
            font-size: 12px;
          }
          .sign-line {
            border-top: 1px dotted #111827;
            margin: 0 8px 8px;
            height: 36px;
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
              <h1>${escapeHtml(VOUCHER_PRINT_TEXT.depositWithdrawalTitle)}</h1>
              <p>${escapeHtml(voucher.number)}</p>
            </div>
            <div class="header-right">
              <div class="copy-mark">${escapeHtml(copyLabel)}</div>
              <div><strong>${escapeHtml(companyName)}</strong></div>
              <div>${escapeHtml(branchAddress || '-')}</div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.rbiLicNo)}: ${escapeHtml(
                printCompany?.aeonLicNo || '-'
              )}</div>
            </div>
          </div>

          <div class="meta">
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.voucherNo)}:</strong> ${escapeHtml(voucher.number)}</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.voucherDate)}:</strong> ${escapeHtml(formatDate(voucher.transactionDate))}</div>
            <div><strong>${escapeHtml(VOUCHER_PRINT_TEXT.paymentRef)}:</strong> ${escapeHtml(paymentRefLine(voucher))}</div>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.accountCode)}</th>
                <th>${escapeHtml(VOUCHER_PRINT_TEXT.account)}</th>
                <th class="right">${escapeHtml(VOUCHER_PRINT_TEXT.debit)}</th>
                <th class="right">${escapeHtml(VOUCHER_PRINT_TEXT.credit)}</th>
              </tr>
            </thead>
            <tbody>
              ${
                itemRows ||
                `<tr><td colspan="4">${escapeHtml(VOUCHER_PRINT_TEXT.noItems)}</td></tr>`
              }
              <tr class="totals">
                <td colspan="2"></td>
                <td class="right">${escapeHtml(formatAmount(voucher.totalDebit))}</td>
                <td class="right">${escapeHtml(formatAmount(voucher.totalCredit))}</td>
              </tr>
            </tbody>
          </table>

          <div class="narration">
            <strong>${escapeHtml(VOUCHER_PRINT_TEXT.narration)}:</strong>
            ${escapeHtml(voucher.narration?.trim() || '-')}
          </div>
          ${
            preparedName
              ? `<div class="prepared-name">${escapeHtml(preparedName)}</div>`
              : ''
          }

          <div class="signatures">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.preparedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.checkedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.approvedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(VOUCHER_PRINT_TEXT.signature)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildVoucherPrintHtml = ({
  copyType,
  voucher,
  company,
  preparedByName,
}: {
  copyType: VoucherPrintCopyType;
  voucher: AccountingVoucher;
  company: ICompanyProfile | null;
  preparedByName?: string | null;
}) => {
  if (voucher.voucherType === 'DEPOSIT_WITHDRAWAL') {
    return buildDepositWithdrawalPrintHtml({
      copyType,
      voucher,
      company,
      preparedByName,
    });
  }

  if (voucher.voucherType === 'ADVICE') {
    return buildAdvicePrintHtml({
      copyType,
      voucher,
      company,
      preparedByName,
    });
  }

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
          <td>${escapeHtml(
            snapshotCode(
              item.subledgerPartyProfileSnapshot ?? item.subledgerBranchSnapshot
            )
          )}</td>
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
