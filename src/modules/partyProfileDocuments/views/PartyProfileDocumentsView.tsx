import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button1';
import { CardSection } from '@/components/ui';
import { Accordion } from '@/components/ui/accordion';
import { usePermission } from '@/hooks';
import { useGetPartyProfile } from '@/modules/partyProfiles/hooks';
import { toPartyProfileApiType, toPartyProfileRouteType } from '@/modules/partyProfiles/constants';
import { useGetPartyProfileDocuments, useUploadPartyProfileDocument } from '../hooks';
import { PartyProfileDocumentProfileSection } from '../components';
import { NotFoundState } from '@/components/ui/not-found-state';

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
  const { canView: canViewPartyProfileType } = usePermission(
    selectedType ? `/party-profiles/${selectedType}` : '/party-profiles'
  );

  const { data: partyProfile, isLoading: isPartyProfileLoading, error: partyProfileError } =
    useGetPartyProfile(id || '', selectedApiType, Boolean(id && selectedApiType && canViewPartyProfileType));
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

  if (!canViewPartyProfileType || partyProfileError || partyProfileDocumentsError || !partyProfile) {
    return <NotFoundState message="Party profile documents were not found." />;
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
        <Accordion type="single" collapsible defaultValue="">
          {documentProfiles.map(profile => (
            <Accordion.Item key={profile.id} value={profile.id}>
              <Accordion.Trigger>
                <div className="flex min-w-0 flex-col gap-1 text-left">
                  <span className="text-sm font-semibold text-text-primary">
                    {profile.documentCode} · {profile.documentDescription}
                  </span>
                  <span className="text-xs font-normal text-text-tertiary">
                    {profile.specificationType} · {profile.isRequired ? 'Required' : 'Optional'} ·
                    {profile.documentFile ? ` Uploaded: ${profile.documentFile.fileName}` : ' Not uploaded'}
                  </span>
                </div>
              </Accordion.Trigger>
              <Accordion.Content>
                <PartyProfileDocumentProfileSection
                  partyProfileId={id || ''}
                  profile={profile}
                  disabled={isUploading}
                  onUpload={handleUpload}
                />
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
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
