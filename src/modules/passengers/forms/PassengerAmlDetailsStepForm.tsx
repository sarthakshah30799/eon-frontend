import type { PassengerEntityType } from '../types/passengerTypes';
import { PassengerDetailsFields } from '../components/PassengerDetailsFields';

interface PassengerAmlDetailsStepFormProps {
  entityType: PassengerEntityType;
  onPanFieldBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

export const PassengerAmlDetailsStepForm = ({
  entityType,
  onPanFieldBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerAmlDetailsStepFormProps) => (
  <PassengerDetailsFields
    entityType={entityType}
    onPanFieldBlur={onPanFieldBlur}
    onPassportFieldBlur={onPassportFieldBlur}
    onNationalityChange={onNationalityChange}
  />
);
