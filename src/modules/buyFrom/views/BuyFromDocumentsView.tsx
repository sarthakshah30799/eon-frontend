import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@/components/ui/loader';
import { Button, CardSection } from '@/components/ui';
import { documentProfileApi } from '@/api/documentProfile';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components/DocumentRequirementCard';
import type { BuyFromPageType } from '@/pages/buy-from/[slug]/buyFromPage.enum';
import { getBuyFromPageTitle } from '@/pages/buy-from/[slug]/buyFromPage.enum';

interface BuyFromDocumentsViewProps {
  buyFromPageType: BuyFromPageType | null;
}

export const BuyFromDocumentsView = ({
  buyFromPageType,
}: BuyFromDocumentsViewProps) => {
  const navigate = useNavigate();
  const [stagedFiles, setStagedFiles] = useState<Record<string, File | null>>({});

  const { data: documentProfiles = [], isLoading, error } = useQuery({
    queryKey: ['buy-from-transaction-document-profiles'],
    queryFn: () => documentProfileApi.getDocumentProfiles({ active: true }),
  });

  const transactionDocumentProfiles = useMemo(
    () =>
      documentProfiles.filter(
        profile =>
          profile.specificationType === 'TRANSACTION' ||
          profile.type?.value === 'TRANSACTION'
      ),
    [documentProfiles]
  );

  const handleStageUpload = async (documentProfileId: string, file: File) => {
    setStagedFiles(prev => ({
      ...prev,
      [documentProfileId]: file,
    }));
  };

  const handleClearStage = async (documentProfileId: string) => {
    setStagedFiles(prev => {
      const next = { ...prev };
      delete next[documentProfileId];
      return next;
    });
  };

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
      <CardSection heading={getBuyFromPageTitle(buyFromPageType)}>
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-semibold text-text-primary">Document Upload</p>
          <p className="text-sm text-text-secondary">
            Upload the transaction documents defined by the document profile master.
          </p>
        </div>
      </CardSection>

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

      <div className="flex flex-wrap justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Back to Buy Form
        </Button>
        <Button type="button" onClick={() => navigate(-1)}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BuyFromDocumentsView;
