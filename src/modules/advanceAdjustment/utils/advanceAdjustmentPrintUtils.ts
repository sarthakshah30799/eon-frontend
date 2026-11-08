import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import {
  snapshotAddress,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';
import { formatDateTime } from '@/utils';
import { ADVANCE_ADJUSTMENT_PRINT_TEXT } from '../constants';
import type {
  AdvanceAdjustment,
  AdvanceAdjustmentItem,
  AdvanceAdjustmentPrintCopyType,
  AdvanceAdjustmentSnapshot,
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

const snapshotLabel = (snapshot?: AdvanceAdjustmentSnapshot | null) =>
  textOrDash(
    String(snapshot?.name ?? snapshot?.label ?? snapshot?.code ?? '').trim() ||
      null
  );

const snapshotCode = (snapshot?: AdvanceAdjustmentSnapshot | null) =>
  textOrDash(
    String(snapshot?.code ?? snapshot?.key ?? snapshot?.name ?? '').trim() ||
      null
  );

const asPrintBranch = (
  snapshot: AdvanceAdjustment['branchSnapshot']
): IBranchProfile | null => {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }
  return toPrintBranch(snapshot as unknown as IBranchProfile);
};

const metaCell = (label: string, value: string) =>
  `<td class="meta-label">${escapeHtml(label)}</td><td class="meta-value">${escapeHtml(value)}</td>`;

const nestedSnapshot = (
  value: unknown
): AdvanceAdjustmentSnapshot | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as AdvanceAdjustmentSnapshot;
};

const saleTypeLabel = (snapshot?: AdvanceAdjustmentSnapshot | null) => {
  const type = String(snapshot?.transactionType ?? '').trim().toUpperCase();
  if (type === 'SALE') {
    return 'PS';
  }
  const slug = String(snapshot?.slug ?? '').trim();
  if (!slug) {
    return textOrDash(type || null);
  }
  if (slug.toUpperCase().startsWith('SALE')) {
    return 'PS';
  }
  return slug;
};

const passengerName = (
  item: AdvanceAdjustmentItem,
  fallbackPanName: string
) => {
  const passenger = nestedSnapshot(item.transactionSnapshot?.passengerSnapshot);
  if (passenger) {
    const fromPassenger = textOrDash(
      String(
        passenger.name ??
          passenger.label ??
          passenger.passengerName ??
          passenger.fullName ??
          ''
      ).trim() || null
    );
    if (fromPassenger !== '-') {
      return fromPassenger;
    }
  }
  return textOrDash(fallbackPanName);
};

const agentCode = (item: AdvanceAdjustmentItem) => {
  const agent = nestedSnapshot(item.transactionSnapshot?.agentProfileSnapshot);
  return snapshotCode(agent);
};

const rowPartyCode = (
  item: AdvanceAdjustmentItem,
  headerPartyCode: string
) => {
  const party = nestedSnapshot(item.transactionSnapshot?.partyProfileSnapshot);
  const fromItem = snapshotCode(party);
  return fromItem !== '-' ? fromItem : headerPartyCode;
};

export const getAdvanceAdjustmentPrintCopyType = (
  printCount?: number | null
): AdvanceAdjustmentPrintCopyType =>
  (printCount ?? 0) === 0 ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';

export const getAdvanceAdjustmentPrintCopyLabel = (
  copyType: AdvanceAdjustmentPrintCopyType
) =>
  copyType === 'DUPLICATE_COPY'
    ? ADVANCE_ADJUSTMENT_PRINT_TEXT.duplicateCopy
    : ADVANCE_ADJUSTMENT_PRINT_TEXT.originalCopy;

export const buildAdvanceAdjustmentPrintHtml = ({
  copyType,
  record,
  company,
}: {
  copyType: AdvanceAdjustmentPrintCopyType;
  record: AdvanceAdjustment;
  company: ICompanyProfile | null;
}) => {
  const printCompany = toPrintCompany(company);
  const printBranch = asPrintBranch(record.branchSnapshot);
  const branchAddress = snapshotAddress(printBranch);
  const copyLabel = getAdvanceAdjustmentPrintCopyLabel(copyType);
  const partyCode = snapshotCode(record.partyProfileSnapshot);
  const partyName = snapshotLabel(record.partyProfileSnapshot);
  const partyDisplay =
    partyCode !== '-' && partyName !== '-' && partyCode !== partyName
      ? `${partyCode} / ${partyName}`
      : partyName !== '-'
        ? partyName
        : partyCode;
  const companyName =
    printCompany?.name || ADVANCE_ADJUSTMENT_PRINT_TEXT.companyFallback;

  const logoHtml = printCompany?.logo
    ? `<img src="${escapeHtml(printCompany.logo)}" alt="${escapeHtml(companyName)}" />`
    : `<div class="logo-fallback">${escapeHtml(
        printCompany?.shortCode ||
          printCompany?.name ||
          ADVANCE_ADJUSTMENT_PRINT_TEXT.logoFallback
      )}</div>`;

  const sortedItems = (record.items ?? [])
    .slice()
    .sort((a, b) => a.lineNo - b.lineNo);

  const itemRows = sortedItems
    .map(item => {
      const sale = item.transactionSnapshot;
      return `
        <tr>
          <td class="center">${escapeHtml(String(item.lineNo))}</td>
          <td>${escapeHtml(saleTypeLabel(sale))}</td>
          <td>${escapeHtml(textOrDash(String(sale?.number ?? '')))}</td>
          <td>${escapeHtml(formatDate(sale?.transactionDate))}</td>
          <td>${escapeHtml(rowPartyCode(item, partyCode))}</td>
          <td>${escapeHtml(agentCode(item))}</td>
          <td>${escapeHtml(passengerName(item, record.panName || ''))}</td>
          <td class="right">${escapeHtml(formatAmount(item.adjustmentAmount))}</td>
        </tr>`;
    })
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
          .muted {
            color: #6b7280;
          }
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
            width: 14%;
            white-space: nowrap;
            background: #f8fafc;
          }
          .meta-value {
            width: 36%;
          }
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
            margin-bottom: 28px;
            font-size: 13px;
            font-weight: 700;
          }
          .totals span {
            border-bottom: 3px double #111827;
            min-width: 120px;
            text-align: right;
            padding: 4px 0;
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
              <h1>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.title)}</h1>
              <p>${escapeHtml(record.number)}</p>
            </div>
            <div class="header-right">
              <div class="copy-mark">${escapeHtml(copyLabel)}</div>
              <div><strong>${escapeHtml(companyName)}</strong></div>
              <div>${escapeHtml(branchAddress || '-')}</div>
              <div>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.rbiLicNo)}: ${escapeHtml(
                printCompany?.aeonLicNo || '-'
              )}</div>
            </div>
          </div>

          <table class="doc-meta">
            <tr>
              ${metaCell(ADVANCE_ADJUSTMENT_PRINT_TEXT.documentNo, record.number)}
              ${metaCell(
                ADVANCE_ADJUSTMENT_PRINT_TEXT.date,
                formatDate(record.transactionDate)
              )}
            </tr>
            <tr>
              ${metaCell(ADVANCE_ADJUSTMENT_PRINT_TEXT.party, partyDisplay)}
              ${metaCell(ADVANCE_ADJUSTMENT_PRINT_TEXT.forAccount, '-')}
            </tr>
            <tr>
              ${metaCell(ADVANCE_ADJUSTMENT_PRINT_TEXT.advReceiptNo, '-')}
              ${metaCell(
                ADVANCE_ADJUSTMENT_PRINT_TEXT.adjAmount,
                formatAmount(record.totalAdjustmentAmount)
              )}
            </tr>
            <tr>
              <td class="meta-label">${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.narration)}</td>
              <td class="meta-value" colspan="3">${escapeHtml(textOrDash(record.narration))}</td>
            </tr>
          </table>

          <table class="items">
            <thead>
              <tr>
                <th>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.srNo)}</th>
                <th>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.type)}</th>
                <th>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.no)}</th>
                <th>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.date)}</th>
                <th>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.code)}</th>
                <th>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.agentCode)}</th>
                <th>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.passenger)}</th>
                <th class="right">${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.amount)}</th>
              </tr>
            </thead>
            <tbody>
              ${
                itemRows ||
                `<tr><td colspan="8">${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.noItems)}</td></tr>`
              }
            </tbody>
          </table>

          <div class="totals">
            <div>
              ${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.total)}:
              <span>${escapeHtml(formatAmount(record.totalAdjustmentAmount))}</span>
            </div>
          </div>

          <div class="signatures">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.preparedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.checkedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.approvedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_ADJUSTMENT_PRINT_TEXT.signature)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
