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
          name="companyName"
          label="Company Name"
          disabled={isSaving}
        />
        <FormFieldInput name="rbiName" label="RBI Name" disabled={isSaving} />
        <FormFieldInput
          name="rbiDesignation"
          label="RBI Designation"
          disabled={isSaving}
        />
        <FormFieldInput name="rbiPlace" label="RBI Place" disabled={isSaving} />
        <FormFieldInput
          name="rbiAddress1"
          label="RBI Address 1"
          disabled={isSaving}
        />
        <FormFieldInput
          name="rbiAddress2"
          label="RBI Address 2"
          disabled={isSaving}
        />
        <FormFieldInput
          name="rbiAddress3"
          label="RBI Address 3"
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
