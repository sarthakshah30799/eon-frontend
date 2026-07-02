import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import type { PartyProfileType } from '@/modules/partyProfiles/constants';
import type { IBuyFromFormValues } from '../types/buyFromTypes';
import { formatBuyFromEntityLabel } from '../utils/buyFromUtils';
import { EntityPickerField } from './EntityPickerField';

interface BuyFromPartyProfileFieldProps {
  partyProfileTypes: PartyProfileType[];
  disabled?: boolean;
}

export const BuyFromPartyProfileField = ({
  partyProfileTypes,
  disabled = false,
}: BuyFromPartyProfileFieldProps) => {
  const form = useFormContext<IBuyFromFormValues>();
  const [open, setOpen] = useState(false);

  const partyProfileCode = form.watch('partyProfileCode');
  const partyProfileName = form.watch('partyProfileName');

  return (
    <>
      <EntityPickerField
        label="Party Profile"
        value={formatBuyFromEntityLabel(partyProfileCode, partyProfileName)}
        placeholder="Select party profile"
        onClick={() => setOpen(true)}
        disabled={disabled}
        helperText="Choose a party profile for this buy-from transaction."
      />

      <SelectPartyProfiles
        open={open}
        types={partyProfileTypes}
        selectable
        multiple={false}
        title="Select Party Profile"
        description="Choose a single party profile for the buy-from transaction."
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

export default BuyFromPartyProfileField;
