import { Button } from '@/components/ui/button1';
import { Form, FormFieldInput } from '@/components/forms';
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
        />
        <FormFieldInput
          name="city"
          label="City"
          disabled={isSaving}
        />
        <FormFieldInput
          name="state"
          label="State"
          disabled={isSaving}
        />
        <FormFieldInput
          name="country"
          label="Country"
          disabled={isSaving}
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
