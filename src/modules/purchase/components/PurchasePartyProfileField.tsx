import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import { HighRiskPartyProfileWarningModal } from './HighRiskPartyProfileWarningModal';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import type { IPartyProfileListQuery } from '@/modules/partyProfiles/types';
import type { IPurchaseFormValues } from '../types/purchaseTypes';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import { PassengerEntityTypeEnum } from '@/modules/passengers/types/passengerTypes';
import {
  formatPurchaseEntityLabel,
  getPurchaseTransactionPartyProfileFilter,
} from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';

interface PurchasePartyProfileFieldProps {
  partyProfileTypes: PartyProfileType[];
  purchasePageType?: PurchasePageType | null;
  disabled?: boolean;
  showPassengerAction?: boolean;
  onAddPassengerInfo?: () => void;
}

export const PurchasePartyProfileField = ({
  partyProfileTypes,
  purchasePageType = null,
  disabled = false,
  showPassengerAction = false,
  onAddPassengerInfo,
}: PurchasePartyProfileFieldProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [open, setOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedProfileForWarning, setSelectedProfileForWarning] = useState<IPartyProfile | null>(null);

  const partyProfileCode = form.watch('partyProfileCode');
  const partyProfileName = form.watch('partyProfileName');
  const partyProfileId = useWatch({
    control: form.control,
    name: 'partyProfileId',
  });
  const entityType = useWatch({
    control: form.control,
    name: 'entityType',
  });
  const passengerInfoCaptured = useWatch({
    control: form.control,
    name: 'passengerInfoCaptured',
  });
  const nationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const panNumber = useWatch({
    control: form.control,
    name: 'panNumber',
  });
  const panHolderName = useWatch({
    control: form.control,
    name: 'panHolderName',
  });
  const passportNumber = useWatch({
    control: form.control,
    name: 'passportNumber',
  });
  const transactionType = useWatch({
    control: form.control,
    name: 'transactionType',
  });
  const profileQueryParams = {
    ...getPurchaseTransactionPartyProfileFilter(transactionType, purchasePageType),
    activeOnly: true,
  } satisfies Pick<IPartyProfileListQuery, 'sale' | 'purchase' | 'activeOnly' | 'isIndividual'>;

  const proceedWithProfileSelection = (selectedProfile: IPartyProfile) => {
    form.setValue('partyProfileId', selectedProfile.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('partyProfileCode', selectedProfile.code, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileName', selectedProfile.name, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileEmail', selectedProfile.email || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfilePhoneNo', selectedProfile.phoneNo || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileAddress1', selectedProfile.address1 || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileAddress2', selectedProfile.address2 || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileAddress3', selectedProfile.address3 || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileCity', selectedProfile.city || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfilePinCode', selectedProfile.pinCode || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfilePanNo', selectedProfile.panNo || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileGstNo', selectedProfile.gstNo || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue(
      'partyProfileGstStateName',
      selectedProfile.gstStateName || '',
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
    form.setValue('partyProfileStateName', selectedProfile.stateName || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileContactName', selectedProfile.contactName || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('partyProfileApplyTax', selectedProfile.applyTax, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setOpen(false);
  };

  const handleWarningProceed = () => {
    if (selectedProfileForWarning) {
      proceedWithProfileSelection(selectedProfileForWarning);
    }
    setWarningModalOpen(false);
    setSelectedProfileForWarning(null);
  };

  const handleWarningCancel = () => {
    setWarningModalOpen(false);
    setSelectedProfileForWarning(null);
  };

  return (
    <>
      <div className="space-y-2">
        <EntityPickerField
          label="Party Profile"
          value={formatPurchaseEntityLabel(partyProfileCode, partyProfileName)}
          placeholder="Select party profile"
          onClick={() => setOpen(true)}
          disabled={disabled}
          helperText="Choose a party profile for this transaction."
        />

        {showPassengerAction ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || !partyProfileId || !entityType}
            onClick={() => {
              onAddPassengerInfo?.();
            }}
          >
            Add Passenger Info
          </Button>
        ) : null}

        {passengerInfoCaptured ? (
          <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
            <div className="font-medium text-text-primary">Passenger Captured</div>
            <div className="mt-1">
              {entityType === PassengerEntityTypeEnum.CORPORATE
                ? 'Corporate passenger'
                : 'Individual passenger'}
            </div>
            <div className="mt-1">
              {nationalityType === 'INDIAN'
                ? `PAN: ${panNumber || '-'}`
                : `Passport: ${passportNumber || '-'}`}
            </div>
            {panHolderName ? (
              <div className="mt-1">{panHolderName}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <SelectPartyProfiles
        open={open}
        types={partyProfileTypes}
        selectable
        multiple={false}
        title="Select Party Profile"
        description="Choose a single party profile for the transaction."
        queryParams={profileQueryParams}
        onContinue={profiles => {
          const selectedProfile = profiles[0];
          if (!selectedProfile) {
            return;
          }

          // Check if the selected profile has high risk category
          if (selectedProfile.kycRiskCategory?.value === 'HIGH_RISK') {
            setSelectedProfileForWarning(selectedProfile);
            setWarningModalOpen(true);
            return;
          }

          // If not high risk, proceed with normal flow
          proceedWithProfileSelection(selectedProfile);
        }}
        onClose={() => setOpen(false)}
      />

      <HighRiskPartyProfileWarningModal
        isOpen={warningModalOpen}
        partyProfileName={selectedProfileForWarning?.name || ''}
        onConfirm={handleWarningProceed}
        onCancel={handleWarningCancel}
        onClose={handleWarningCancel}
      />
    </>
  );
};

export default PurchasePartyProfileField;
