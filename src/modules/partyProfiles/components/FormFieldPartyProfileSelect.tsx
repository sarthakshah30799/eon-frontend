import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { EntityPickerField } from '@/modules/purchase/components/EntityPickerField';
import { formatPurchaseEntityLabel } from '@/modules/purchase/utils/purchaseUtils';
import { SelectPartyProfiles } from './SelectPartyProfiles';
import { useGetPartyProfile } from '../hooks';
import type { PartyProfileType } from '../types';

interface FormFieldPartyProfileSelectProps {
  name: string;
  label: string;
  types: PartyProfileType | PartyProfileType[];
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
}

export const FormFieldPartyProfileSelect = ({
  name,
  label,
  types,
  placeholder = 'Select party profile',
  disabled = false,
  helperText,
}: FormFieldPartyProfileSelectProps) => {
  const form = useFormContext<Record<string, string | undefined>>();
  const [open, setOpen] = useState(false);
  const selectedId = form.watch(name);
  const normalizedTypes = useMemo(
    () => (Array.isArray(types) ? types : [types]),
    [types]
  );

  const { data: selectedProfile, isLoading } = useGetPartyProfile(
    selectedId || '',
    normalizedTypes[0],
    Boolean(selectedId)
  );

  const displayValue = selectedProfile
    ? formatPurchaseEntityLabel(
        selectedProfile.code,
        selectedProfile.name
      )
    : '';

  return (
    <>
      <EntityPickerField
        label={label}
        value={isLoading && selectedId ? 'Loading...' : displayValue}
        placeholder={placeholder}
        onClick={() => setOpen(true)}
        disabled={disabled}
        helperText={helperText}
      />

      <SelectPartyProfiles
        open={open}
        types={types}
        selectable
        multiple={false}
        title={label}
        description={`Choose a ${label.toLowerCase()}.`}
        initialSelectedProfiles={selectedProfile ? [selectedProfile] : []}
        onContinue={profiles => {
          const profile = profiles[0];
          form.setValue(name, profile?.id ?? '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default FormFieldPartyProfileSelect;
