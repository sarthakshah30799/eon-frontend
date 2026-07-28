import type { PassengerEntityType, PassengerAmlPartyProfile } from '../types/passengerTypes';
import { PassengerVerificationFields } from '../components/PassengerVerificationFields';

interface PassengerAmlVerificationStepFormProps {
  entityType: PassengerEntityType;
  isCorporate: boolean;
  selectedPartyProfile?: PassengerAmlPartyProfile | null;
  isSelectedPartyProfileLoading?: boolean;
  showPanRelation?: boolean;
  verificationStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  verificationMessage: string | null;
  onPanFieldBlur?: () => void;
  onPassportNumberBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

const toProfileLabel = (profile?: PassengerAmlPartyProfile | null) =>
  profile
    ? `${profile.isIndividual ? 'Individual Profile' : 'Corporate Profile'}${
        profile.name ? ` (${profile.name})` : ''
      }`
    : 'No party profile selected yet';

export const PassengerAmlVerificationStepForm = ({
  entityType,
  isCorporate,
  selectedPartyProfile,
  isSelectedPartyProfileLoading = false,
  showPanRelation = false,
  verificationStatus,
  verificationMessage,
  onPanFieldBlur,
  onPassportNumberBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerAmlVerificationStepFormProps) => (
  <PassengerVerificationFields
    entityType={entityType}
    isCorporate={isCorporate}
    selectedPartyProfileLabel={toProfileLabel(selectedPartyProfile)}
    isSelectedPartyProfileLoading={isSelectedPartyProfileLoading}
    showPanRelation={showPanRelation}
    verificationStatus={verificationStatus}
    verificationMessage={verificationMessage}
    onPanFieldBlur={onPanFieldBlur}
    onPassportNumberBlur={onPassportNumberBlur}
    onPassportFieldBlur={onPassportFieldBlur}
    onNationalityChange={onNationalityChange}
  />
);
