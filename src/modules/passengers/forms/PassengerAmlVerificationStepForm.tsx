import type { PassengerEntityType, PassengerAmlPartyProfile } from '../types/passengerTypes';
import { PassengerVerificationFields } from '../components/PassengerVerificationFields';

interface PassengerAmlVerificationStepFormProps {
  entityType: PassengerEntityType;
  isCorporate: boolean;
  selectedPartyProfile?: PassengerAmlPartyProfile | null;
  isSelectedPartyProfileLoading?: boolean;
  verificationStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  verificationMessage: string | null;
  onPanFieldBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

const toProfileLabel = (profile?: PassengerAmlPartyProfile | null) =>
  profile
    ? `${profile.name}${profile.type ? ` (${profile.type})` : ''}`
    : 'No party profile selected yet';

export const PassengerAmlVerificationStepForm = ({
  entityType,
  isCorporate,
  selectedPartyProfile,
  isSelectedPartyProfileLoading = false,
  verificationStatus,
  verificationMessage,
  onPanFieldBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerAmlVerificationStepFormProps) => (
  <PassengerVerificationFields
    entityType={entityType}
    isCorporate={isCorporate}
    selectedPartyProfileLabel={toProfileLabel(selectedPartyProfile)}
    isSelectedPartyProfileLoading={isSelectedPartyProfileLoading}
    verificationStatus={verificationStatus}
    verificationMessage={verificationMessage}
    onPanFieldBlur={onPanFieldBlur}
    onPassportFieldBlur={onPassportFieldBlur}
    onNationalityChange={onNationalityChange}
  />
);
