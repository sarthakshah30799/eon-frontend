import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';
import { Button, CardSection, Modal } from '@/components/ui';
import { documentProfileApi } from '@/api/documentProfile';
import { mailApi, transactionsApi } from '@/api';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components/DocumentRequirementCard';
import { useAuth } from '@/lib/AuthContext';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import {
  getAdditionalSettingTextValue,
} from '@/modules/additionalSettings/utils';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import type { IPurchaseFormValues } from '../types/purchaseTypes';
import {
  buildPurchasePrintHtml,
  getPurchasePrintCopyLabel,
} from '../utils/purchasePrintUtils';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { getPurchasePageTitle } from '@/pages/purchase/[slug]/purchasePage.enum';
import type { ICompanyProfile } from '@/modules/companyProfile/types';

interface PurchaseDocumentsViewProps {
  purchasePageType: PurchasePageType | null;
}

interface PurchaseDocumentsLocationState {
  transactionId?: string;
  transactionNumber?: string;
  transactionValues?: IPurchaseFormValues;
}

const selectCurrentCompany = (companies: ICompanyProfile[]) => {
  const now = new Date();

  const activeCompany = companies.find(company => {
    const fromDate = company.fromDate ? new Date(company.fromDate) : null;
    const toDate = company.toDate ? new Date(company.toDate) : null;

    if (fromDate && now < fromDate) {
      return false;
    }

    if (toDate && now > toDate) {
      return false;
    }

    return true;
  });

  return activeCompany ?? companies[0] ?? null;
};

const openPrintWindow = (html: string) => {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow pop-ups and try again.');
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

export const PurchaseDocumentsView = ({
  purchasePageType,
}: PurchaseDocumentsViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeBranchId } = useAuth();
  const [stagedFiles, setStagedFiles] = useState<Record<string, File | null>>({});
  const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const draftReference = useMemo(() => {
    const state = location.state as PurchaseDocumentsLocationState | null | undefined;
    return state ?? null;
  }, [location.state]);

  const transactionValues = draftReference?.transactionValues ?? null;
  const transactionId = draftReference?.transactionId ?? '';
  const transactionNumber = draftReference?.transactionNumber ?? transactionValues?.number ?? '';

  const { data: documentProfiles = [], isLoading, error } = useQuery({
    queryKey: ['purchase-transaction-document-profiles', purchasePageType],
    queryFn: () =>
      documentProfileApi.resolveDocumentProfiles({
        specificationType: 'TRANSACTION',
        type: purchasePageType ?? undefined,
      }),
    enabled: Boolean(purchasePageType),
  });

  const { data: branchProfile } = useGetBranchProfile(activeBranchId ?? '');
  const { data: companies = [] } = useListCompanyProfiles();
  const { data: additionalSettings = [] } = useListAdditionalSettings();

  const currentCompany = useMemo(() => selectCurrentCompany(companies), [companies]);
  const sacCode = useMemo(
    () =>
      getAdditionalSettingTextValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TransactionPrintSettings,
        AdditionalSettingsCodeEnum.TransactionPrintSacCode,
        ''
      ),
    [additionalSettings]
  );

  const transactionDocumentProfiles = documentProfiles;

  const handleStageUpload = useCallback(async (documentProfileId: string, file: File) => {
    setStagedFiles(prev => ({
      ...prev,
      [documentProfileId]: file,
    }));
  }, []);

  const handleClearStage = useCallback(async (documentProfileId: string) => {
    setStagedFiles(prev => {
      const next = { ...prev };
      delete next[documentProfileId];
      return next;
    });
  }, []);

  const handlePrintCopy = useCallback(
    async (copyType: 'CUSTOMER_COPY' | 'DUPLICATE_COPY', sendEmail = false) => {
      if (!transactionValues || !transactionId || !transactionNumber) {
        toast.error('Missing transaction details for print.');
        return;
      }

      setIsPrinting(true);

      try {
        const html = buildPurchasePrintHtml({
          copyType,
          transactionNumber,
          transactionDate: new Date(),
          company: currentCompany,
          branch: branchProfile ?? null,
          transaction: transactionValues,
          sacCode,
        });

        if (sendEmail) {
          const email = transactionValues.partyProfileEmail.trim();
          if (!email) {
            throw new Error('Selected party profile does not have an email address.');
          }

          setIsEmailing(true);
          await mailApi.sendMail({
            to: email,
            subject: `${transactionNumber} - ${getPurchasePrintCopyLabel(copyType)}`,
            text: `Please find ${getPurchasePrintCopyLabel(copyType).toLowerCase()} for transaction ${transactionNumber}.`,
            html,
          });
          await transactionsApi.recordPrint(transactionId, {
            copyType,
            recipientEmail: email,
            subject: `${transactionNumber} - ${getPurchasePrintCopyLabel(copyType)}`,
            text: `Please find ${getPurchasePrintCopyLabel(copyType).toLowerCase()} for transaction ${transactionNumber}.`,
            html,
            sendEmail: true,
          });
          toast.success('Customer copy emailed successfully');
          return;
        }

        openPrintWindow(html);
        await transactionsApi.recordPrint(transactionId, {
          copyType,
          subject: `${transactionNumber} - ${getPurchasePrintCopyLabel(copyType)}`,
          text: `Printed ${getPurchasePrintCopyLabel(copyType).toLowerCase()} for transaction ${transactionNumber}.`,
          html,
          sendEmail: false,
        });
        toast.success(`${getPurchasePrintCopyLabel(copyType)} sent to printer`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to print or email the transaction copy'
        );
      } finally {
        setIsPrinting(false);
        setIsEmailing(false);
      }
    },
    [branchProfile, currentCompany, sacCode, transactionId, transactionNumber, transactionValues]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
        Failed to load transaction document profiles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardSection heading={getPurchasePageTitle(purchasePageType)}>
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-semibold text-text-primary">Document Upload & Print</p>
          {transactionNumber ? (
            <p className="text-sm text-text-secondary">
              Transaction reference: {transactionNumber}
            </p>
          ) : null}
          <p className="text-sm text-text-secondary">
            Upload the transaction documents defined by the document profile master and print the final bill copy.
          </p>
        </div>
      </CardSection>

      {!transactionValues ? (
        <CardSection heading="No Transaction Snapshot">
          <p className="text-sm text-text-secondary">
            The transaction snapshot was not passed from the create form. Go back and save the transaction again.
          </p>
        </CardSection>
      ) : null}

      {transactionDocumentProfiles.length > 0 ? (
        <div className="grid gap-4">
          {transactionDocumentProfiles.map(profile => (
            <DocumentRequirementCard
              key={profile.id}
              profile={profile}
              selectedFile={stagedFiles[profile.id] ?? null}
              onSelectFile={handleStageUpload}
              onClearFile={handleClearStage}
            />
          ))}
        </div>
      ) : (
        <CardSection heading="No Transaction Documents">
          <p className="text-sm text-text-secondary">
            No active transaction document profiles were found.
          </p>
        </CardSection>
      )}

      {transactionValues ? (
        <CardSection heading="Print Actions" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border-primary bg-surface-primary px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-text-tertiary">Customer Copy</p>
              <p className="mt-1 text-sm text-text-secondary">
                Print the original customer copy immediately.
              </p>
              <Button
                type="button"
                className="mt-3 w-full"
                disabled={isPrinting || isEmailing}
                onClick={() => void handlePrintCopy('CUSTOMER_COPY', false)}
              >
                Print Customer Copy
              </Button>
            </div>

            <div className="rounded-xl border border-border-primary bg-surface-primary px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-text-tertiary">Duplicate Copy</p>
              <p className="mt-1 text-sm text-text-secondary">
                Print a duplicate only after confirmation.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                disabled={isPrinting || isEmailing}
                onClick={() => setDuplicateConfirmOpen(true)}
              >
                Print Duplicate Copy
              </Button>
            </div>

            <div className="rounded-xl border border-border-primary bg-surface-primary px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-text-tertiary">Email Original</p>
              <p className="mt-1 text-sm text-text-secondary">
                Email the customer copy to the selected party profile.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-3 w-full"
                disabled={isPrinting || isEmailing || !transactionValues.partyProfileEmail}
                onClick={() => void handlePrintCopy('CUSTOMER_COPY', true)}
              >
                Email Customer Copy
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Back to Buy Form
            </Button>
            <Button type="button" onClick={() => navigate(-1)}>
              Continue
            </Button>
          </div>
        </CardSection>
      ) : (
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Back to Buy Form
          </Button>
        </div>
      )}

      <Modal
        open={duplicateConfirmOpen}
        onOpenChange={setDuplicateConfirmOpen}
        title="Confirm Duplicate Copy"
        description="Duplicate copy will be printed only after you confirm."
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to print the duplicate copy for {transactionNumber || 'this transaction'}?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDuplicateConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setDuplicateConfirmOpen(false);
                void handlePrintCopy('DUPLICATE_COPY', false);
              }}
            >
              Yes, Print
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseDocumentsView;
