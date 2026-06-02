import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCityDropdown,
  FormFieldCountryDropdown,
  FormFieldFileUploader,
  FormFieldInput,
  FormFieldStateDropdown,
} from '@/components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import { companyProfileSchema } from '../schema';
import type { CompanyProfileFormValues } from '../types';

interface CompanyProfileFormProps {
  defaultValues: CompanyProfileFormValues;
  onSubmit: (values: CompanyProfileFormValues) => void | Promise<void>;
  isSaving?: boolean;
}

export const CompanyProfileForm = ({
  defaultValues,
  onSubmit,
  isSaving = false,
}: CompanyProfileFormProps) => {
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(companyProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
        <FormFieldFileUploader
          name="logo"
          label="Upload Logo"
          accept="image/*"
          helperText="Upload a company logo image."
          disabled={isSaving}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="name"
          label="Company Name"
          disabled={isSaving}
        />
        <FormFieldInput
          name="designation"
          label="RBI Designation"
          disabled={isSaving}
        />
        <FormFieldInput name="rbiName" label="RBI Name" disabled={isSaving} />
        <FormFieldInput name="rbiPlace" label="RBI Place" disabled={isSaving} />
        <FormFieldInput
          name="address1"
          label="Address Line 1"
          disabled={isSaving}
        />
        <FormFieldInput
          name="address2"
          label="Address Line 2"
          disabled={isSaving}
        />
        <FormFieldInput
          name="address3"
          label="Address Line 3"
          disabled={isSaving}
        />
        <FormFieldInput
          name="pincode"
          label="Pincode"
          disabled={isSaving}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
        />
        <FormFieldCityDropdown
          name="city"
          label="City"
          placeholder="Select city"
          disabled={isSaving}
          createLabel="Create"
          onCreateCity={() => undefined}
        />
        <FormFieldStateDropdown
          name="state"
          label="State"
          placeholder="Select state"
          disabled={isSaving}
          createLabel="Create"
        />
        <FormFieldCountryDropdown
          name="country"
          label="Country"
          placeholder="Select country"
          disabled={isSaving}
          createLabel="Create"
        />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Form>
  );
};
