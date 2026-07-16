import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import type { IPartyProfileListQuery } from '@/modules/partyProfiles/types';
import type { IPurchaseFormValues } from '../types/purchaseTypes';
import {
  formatPurchaseEntityLabel,
  getPurchaseTransactionPartyProfileFilter,
} from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';

interface PurchasePartyProfileFieldProps {
  partyProfileTypes: PartyProfileType[];
  disabled?: boolean;
}

export const PurchasePartyProfileField = ({
  partyProfileTypes,
  disabled = false,
}: PurchasePartyProfileFieldProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [open, setOpen] = useState(false);

  const partyProfileCode = form.watch('partyProfileCode');
  const partyProfileName = form.watch('partyProfileName');
  const transactionType = useWatch({
    control: form.control,
    name: 'transactionType',
  });
  const profileQueryParams = {
    ...getPurchaseTransactionPartyProfileFilter(transactionType),
    activeOnly: true,
  } satisfies Pick<IPartyProfileListQuery, 'sale' | 'purchase' | 'activeOnly'>;

  return (
    <>
      <EntityPickerField
        label="Party Profile"
        value={formatPurchaseEntityLabel(partyProfileCode, partyProfileName)}
        placeholder="Select party profile"
        onClick={() => setOpen(true)}
        disabled={disabled}
        helperText="Choose a party profile for this transaction."
      />

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
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default PurchasePartyProfileField;
