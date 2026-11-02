import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import {
  snapshotAddress,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';
import { formatDateTime } from '@/utils';
import { ADVANCE_REFUND_PRINT_TEXT } from '../constants';
import type {
  AdvanceRefund,
  AdvanceRefundItem,
  AdvanceRefundPrintCopyType,
  AdvanceRefundSnapshot,
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

const snapshotPartyName = (snapshot?: AdvanceRefundSnapshot | null) =>
  textOrDash(
    String(snapshot?.name ?? snapshot?.label ?? snapshot?.code ?? '').trim() ||
      null
  );

const snapshotEntityType = (snapshot?: AdvanceRefundSnapshot | null) => {
  if (!snapshot || typeof snapshot !== 'object') {
    return '-';
  }

  const entityType = snapshot.entityType as
    | AdvanceRefundSnapshot
    | string
    | null
    | undefined;

  if (!entityType) {
    return '-';
  }

  if (typeof entityType === 'string') {
    return textOrDash(entityType);
  }

  return textOrDash(
    String(
      entityType.code ??
        entityType.value ??
        entityType.key ??
        entityType.name ??
        entityType.label ??
        ''
    ).trim() || null
  );
};

const snapshotBankLabel = (record: AdvanceRefund) => {
  const bankSnapshot = record.payingBankAccountSnapshot;
  const fromSnapshot = [
    bankSnapshot?.code,
    bankSnapshot?.accountCode,
    bankSnapshot?.name,
    bankSnapshot?.accountName,
    bankSnapshot?.label,
  ]
    .map(part => String(part ?? '').trim())
    .filter(Boolean)
    .join(' - ');

  return textOrDash(fromSnapshot || record.bankName);
};

const asPrintBranch = (
  snapshot: AdvanceRefund['branchSnapshot']
): IBranchProfile | null => {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }
  return toPrintBranch(snapshot as unknown as IBranchProfile);
};

const metaCell = (label: string, value: string) =>
  `<td class="meta-label">${escapeHtml(label)}</td><td class="meta-value">${escapeHtml(value)}</td>`;

const itemPartyName = (item: AdvanceRefundItem, fallback: string) => {
  const nested = item.receiptVoucherSnapshot?.partyProfileSnapshot as
    | AdvanceRefundSnapshot
    | undefined;
  if (nested && typeof nested === 'object') {
    return snapshotPartyName(nested);
  }
  return fallback;
};

const itemEntityType = (item: AdvanceRefundItem, fallback: string) => {
  const nested = item.receiptVoucherSnapshot?.partyProfileSnapshot as
    | AdvanceRefundSnapshot
    | undefined;
  if (nested && typeof nested === 'object') {
    const resolved = snapshotEntityType(nested);
    if (resolved !== '-') {
      return resolved;
    }
  }
  return fallback;
};

export const getAdvanceRefundPrintCopyType = (
  printCount?: number | null
): AdvanceRefundPrintCopyType =>
  (printCount ?? 0) === 0 ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';

export const getAdvanceRefundPrintCopyLabel = (
  copyType: AdvanceRefundPrintCopyType
) =>
  copyType === 'DUPLICATE_COPY'
    ? ADVANCE_REFUND_PRINT_TEXT.duplicateCopy
    : ADVANCE_REFUND_PRINT_TEXT.originalCopy;

export const buildAdvanceRefundPrintHtml = ({
  copyType,
  record,
  company,
}: {
  copyType: AdvanceRefundPrintCopyType;
  record: AdvanceRefund;
  company: ICompanyProfile | null;
}) => {
  const printCompany = toPrintCompany(company);
  const printBranch = asPrintBranch(record.branchSnapshot);
  const branchAddress = snapshotAddress(printBranch);
  const copyLabel = getAdvanceRefundPrintCopyLabel(copyType);
  const partyName = snapshotPartyName(record.partyProfileSnapshot);
  const partyType = snapshotEntityType(record.partyProfileSnapshot);
  const paxName = textOrDash(record.panName);
  const companyName =
    printCompany?.name || ADVANCE_REFUND_PRINT_TEXT.companyFallback;

  const logoHtml = printCompany?.logo
    ? `<img src="${escapeHtml(printCompany.logo)}" alt="${escapeHtml(companyName)}" />`
    : `<div class="logo-fallback">${escapeHtml(
        printCompany?.shortCode ||
          printCompany?.name ||
          ADVANCE_REFUND_PRINT_TEXT.logoFallback
      )}</div>`;

  const itemRows = (record.items ?? [])
    .slice()
    .sort((a, b) => a.lineNo - b.lineNo)
    .map(item => {
      const receipt = item.receiptVoucherSnapshot;
      return `
        <tr>
          <td class="center">${escapeHtml(String(item.lineNo))}</td>
          <td>${escapeHtml(itemPartyName(item, partyName))}</td>
          <td>${escapeHtml(itemEntityType(item, partyType))}</td>
          <td>${escapeHtml(paxName)}</td>
          <td>${escapeHtml(formatDate(receipt?.transactionDate))}</td>
          <td>${escapeHtml(textOrDash(String(receipt?.number ?? '')))}</td>
          <td class="right">${escapeHtml(formatAmount(item.originalReceiptAmount))}</td>
          <td class="right">${escapeHtml(formatAmount(item.originalReceiptAmount))}</td>
          <td class="right">${escapeHtml(formatAmount(item.consumedAmount))}</td>
          <td class="right">${escapeHtml(formatAmount(item.availableAmount))}</td>
          <td class="right">${escapeHtml(formatAmount(item.refundAmount))}</td>
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
            margin-bottom: 28px;
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
              <h1>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.title)}</h1>
              <p>${escapeHtml(record.number)}</p>
            </div>
            <div class="header-right">
              <div class="copy-mark">${escapeHtml(copyLabel)}</div>
              <div><strong>${escapeHtml(companyName)}</strong></div>
              <div>${escapeHtml(branchAddress || '-')}</div>
              <div>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.rbiLicNo)}: ${escapeHtml(
                printCompany?.aeonLicNo || '-'
              )}</div>
            </div>
          </div>

          <table class="doc-meta">
            <tr>
              ${metaCell(ADVANCE_REFUND_PRINT_TEXT.documentNo, record.number)}
              ${metaCell(
                ADVANCE_REFUND_PRINT_TEXT.date,
                formatDate(record.transactionDate)
              )}
            </tr>
            <tr>
              ${metaCell(ADVANCE_REFUND_PRINT_TEXT.party, partyName)}
              ${metaCell(ADVANCE_REFUND_PRINT_TEXT.type, partyType)}
            </tr>
            <tr>
              ${metaCell(
                ADVANCE_REFUND_PRINT_TEXT.chqNo,
                textOrDash(record.chequeNumber)
              )}
              ${metaCell(
                ADVANCE_REFUND_PRINT_TEXT.dated,
                formatDate(record.chequeDate)
              )}
            </tr>
            <tr>
              ${metaCell(ADVANCE_REFUND_PRINT_TEXT.party, partyName)}
              ${metaCell(
                ADVANCE_REFUND_PRINT_TEXT.panCardNo,
                textOrDash(record.panNumber)
              )}
            </tr>
            <tr>
              ${metaCell(
                ADVANCE_REFUND_PRINT_TEXT.refundType,
                textOrDash(record.refundType)
              )}
              ${metaCell(
                ADVANCE_REFUND_PRINT_TEXT.fromWhichBank,
                snapshotBankLabel(record)
              )}
            </tr>
            <tr>
              <td class="meta-label">${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.remark)}</td>
              <td class="meta-value" colspan="3">${escapeHtml(textOrDash(record.narration))}</td>
            </tr>
          </table>

          <table class="items">
            <thead>
              <tr>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.srNo)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.partyCol)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.typeCol)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.paxName)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.rtDate)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.rtNo)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.rtAmount)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.totalAmount)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.adjustmentAmount)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.balanceAmount)}</th>
                <th>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.refAmount)}</th>
              </tr>
            </thead>
            <tbody>
              ${
                itemRows ||
                `<tr><td colspan="11">${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.noItems)}</td></tr>`
              }
            </tbody>
          </table>

          <div class="signatures">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.preparedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.checkedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.approvedBy)}</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>${escapeHtml(ADVANCE_REFUND_PRINT_TEXT.signature)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
