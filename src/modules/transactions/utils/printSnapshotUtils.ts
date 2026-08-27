import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';

export type ICompanySnapshot = ICompanyProfile;
export type IBranchSnapshot = IBranchProfile;

export const snapshotAddress = (
  snapshot: IBranchProfile | IPartyProfile | null | undefined
) => {
  if (!snapshot) {
    return '';
  }

  const gstState = 'gstState' in snapshot ? snapshot.gstState : undefined;
  return [
    snapshot.address1,
    snapshot.address2,
    snapshot.address3,
    snapshot.city,
    gstState,
    snapshot.pinCode,
  ]
    .map(part => part?.trim())
    .filter(Boolean)
    .join(', ');
};

export const toPrintCompany = (
  snapshot: ICompanyProfile | null | undefined
): ICompanyProfile | null => snapshot ?? null;

export const toPrintBranch = (
  snapshot: IBranchProfile | null | undefined
): IBranchProfile | null => snapshot ?? null;

export const openPrintWindow = (html: string, popupBlockedMessage: string) => {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) {
    throw new Error(popupBlockedMessage);
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
