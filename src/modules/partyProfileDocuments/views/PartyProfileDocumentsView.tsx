import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button1';
import { CardSection } from '@/components/ui';
import { useGetPartyProfile } from '@/modules/partyProfiles/hooks';
import { toPartyProfileApiType, toPartyProfileRouteType } from '@/modules/partyProfiles/constants';
import { useGetPartyProfileDocuments, useUploadPartyProfileDocument } from '../hooks';
import { PartyProfileDocumentProfileSection } from '../components';

export const PartyProfileDocumentsView = () => {
  const { type: routeType, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const selectedType = useMemo(
    () => (routeType ? toPartyProfileRouteType(routeType) : ''),
    [routeType],
  );
  const selectedApiType = useMemo(
    () => toPartyProfileApiType(selectedType),
    [selectedType],
  );

  const { data: partyProfile, isLoading: isPartyProfileLoading, error: partyProfileError } =
    useGetPartyProfile(id || '', selectedApiType, Boolean(id && selectedApiType));
  const {
    data: partyProfileDocuments,
    isLoading: isDocumentsLoading,
    error: partyProfileDocumentsError,
  } = useGetPartyProfileDocuments(id || '', Boolean(id));
  const { uploadPartyProfileDocument, isPending: isUploading } = useUploadPartyProfileDocument();

  const handleUpload = async (documentProfileId: string, file: File) => {
    if (!id) {
      return;
    }

    await uploadPartyProfileDocument({
      partyProfileId: id,
      documentProfileId,
      file,
    });
  };

  if (isPartyProfileLoading || isDocumentsLoading) {
    return <Loader />;
  }

  if (partyProfileError || partyProfileDocumentsError || !partyProfile) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load party profile documents.
      </div>
    );
  }

  const profileLabel = `${partyProfile.code} · ${partyProfile.name}`;
  const documentProfiles = partyProfileDocuments?.documentProfiles ?? [];

  return (
    <div className="space-y-6">
      <CardSection heading="Party Profile Documents">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-text-primary">{profileLabel}</p>
            <p className="text-sm text-text-secondary">
              Documents are resolved from the backend using MASTER, the party profile type,
              group, and entity type. Uploads are stored in the database and can be replaced
              later.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-sm"
              onClick={() =>
                navigate(`/party-profiles/${selectedType}/edit/${id}`)
              }
            >
              Back to Profile
            </Button>
          </div>
        </div>
      </CardSection>

      {documentProfiles.length > 0 ? (
        <div className="space-y-4">
          {documentProfiles.map(profile => (
            <PartyProfileDocumentProfileSection
              key={profile.id}
              partyProfileId={id || ''}
              profile={profile}
              disabled={isUploading}
              onUpload={handleUpload}
            />
          ))}
        </div>
      ) : (
        <CardSection heading="No Document Requirements">
          <p className="text-sm text-text-secondary">
            No matching document profiles were found for this party profile.
          </p>
        </CardSection>
      )}
    </div>
  );
};

export default PartyProfileDocumentsView;
