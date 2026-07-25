import type { PassengerEntityType } from '../types/passengerTypes';
import { PassengerDetailsFields } from '../components/PassengerDetailsFields';

interface PassengerAmlDetailsStepFormProps {
  entityType: PassengerEntityType;
  showPanRelation?: boolean;
  onPanFieldBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

export const PassengerAmlDetailsStepForm = ({
  entityType,
  showPanRelation = false,
  onPanFieldBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerAmlDetailsStepFormProps) => (
  <PassengerDetailsFields
    entityType={entityType}
    showPanRelation={showPanRelation}
    onPanFieldBlur={onPanFieldBlur}
    onPassportFieldBlur={onPassportFieldBlur}
    onNationalityChange={onNationalityChange}
  />
);
