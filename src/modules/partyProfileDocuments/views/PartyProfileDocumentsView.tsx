import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, FormFooter } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { NotFoundState } from '@/components/ui/not-found-state';
import { usePermission } from '@/hooks';
import { useGetPartyProfile } from '@/modules/partyProfiles/hooks';
import {
  toPartyProfileApiType,
  toPartyProfileRouteType,
} from '@/modules/partyProfiles/constants';
import {
  useGetPartyProfileDocuments,
  useSavePartyProfileDocuments,
} from '../hooks';
import { PartyProfileDocumentProfileSection } from '../components';
import type { ISavePartyProfileDocumentsPayload } from '../types/partyProfileDocumentTypes';

const PARTY_PROFILE_DOCUMENTS_FORM_ID = 'party-profile-documents-form';

export const PartyProfileDocumentsView = () => {
  const { type: routeType, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const selectedType = useMemo(
    () => (routeType ? toPartyProfileRouteType(routeType) : ''),
    [routeType]
  );
  const selectedApiType = useMemo(() => toPartyProfileApiType(selectedType), [selectedType]);
  const { canView: canViewPartyProfileType } = usePermission(
    selectedType ? `/party-profiles/${selectedType}` : '/party-profiles'
  );

  const {
    data: partyProfile,
    isLoading: isPartyProfileLoading,
    error: partyProfileError,
  } = useGetPartyProfile(
    id || '',
    selectedApiType,
    Boolean(id && selectedApiType && canViewPartyProfileType)
  );
  const {
    data: partyProfileDocuments,
    isLoading: isDocumentsLoading,
    error: partyProfileDocumentsError,
  } = useGetPartyProfileDocuments(id || '', Boolean(id));
  const { savePartyProfileDocuments, isPending: isSaving } = useSavePartyProfileDocuments();
  const [stagedFiles, setStagedFiles] = useState<Record<string, File | null>>({});
  const [saveRevision, setSaveRevision] = useState(0);

  const documentProfiles = partyProfileDocuments?.documentProfiles ?? [];
  const pendingUploads = useMemo(
    (): ISavePartyProfileDocumentsPayload['uploads'] =>
      Object.entries(stagedFiles).flatMap(([documentProfileId, file]) => {
        if (!file) {
          return [];
        }

        return [
          {
            documentProfileId,
            file,
          },
        ];
      }),
    [stagedFiles]
  );
  const hasPendingChanges = pendingUploads.length > 0;

  const handleSelectFile = async (documentProfileId: string, file: File) => {
    setStagedFiles(prev => ({
      ...prev,
      [documentProfileId]: file,
    }));
  };

  const handleClearFile = async (documentProfileId: string) => {
    setStagedFiles(prev => {
      const next = { ...prev };
      delete next[documentProfileId];
      return next;
    });
  };

  const handleSave = async () => {
    if (!id || !hasPendingChanges) {
      return;
    }

    await savePartyProfileDocuments({
      partyProfileId: id,
      uploads: pendingUploads,
    });

    setStagedFiles({});
    setSaveRevision(revision => revision + 1);
  };

  if (isPartyProfileLoading || isDocumentsLoading) {
    return <Loader />;
  }

  if (
    !canViewPartyProfileType ||
    partyProfileError ||
    partyProfileDocumentsError ||
    !partyProfile
  ) {
    return <NotFoundState message="Party profile documents were not found." />;
  }

  const profileLabel = `${partyProfile.code} · ${partyProfile.name}`;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xl text-text-primary">{profileLabel}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-md px-3 text-sm"
          onClick={() => navigate(`/party-profiles/${selectedType}/edit/${id}`)}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
      </div>

      {documentProfiles.length > 0 ? (
        <div className="grid gap-4">
          {documentProfiles.map(profile => (
            <PartyProfileDocumentProfileSection
              key={`${profile.id}-${saveRevision}`}
              partyProfileId={id || ''}
              profile={profile}
              disabled={isSaving}
              selectedFile={stagedFiles[profile.id] ?? null}
              onSelectFile={handleSelectFile}
              onClearFile={handleClearFile}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border-primary bg-surface-primary px-4 py-4 shadow-sm">
          <p className="text-sm text-text-secondary">
            No matching document profiles were found for this party profile.
          </p>
        </div>
      )}

      <FormFooter
        formId={PARTY_PROFILE_DOCUMENTS_FORM_ID}
        submitLabel="Save Documents"
        isSubmitting={isSaving}
        isSubmitDisabled={!hasPendingChanges}
      />

      <form
        id={PARTY_PROFILE_DOCUMENTS_FORM_ID}
        className="hidden"
        onSubmit={event => {
          event.preventDefault();
          void handleSave();
        }}
      />
    </div>
  );
};

export default PartyProfileDocumentsView;
