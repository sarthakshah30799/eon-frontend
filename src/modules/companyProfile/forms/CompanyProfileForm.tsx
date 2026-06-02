import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldFileUploader,
  FormFieldInput,
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
          name="shortCode"
          label="Short Code"
          disabled={isSaving}
        />
        <FormFieldInput
          name="companyName"
          label="Company Name"
          disabled={isSaving}
        />
        <FormFieldInput
          name="formerlyKnownName"
          label="Formerly Known Name"
          disabled={isSaving}
        />
        <FormFieldInput name="cinNo" label="CIN No." disabled={isSaving} />
        <FormFieldInput name="panNo" label="PAN No." disabled={isSaving} />
        <FormFieldInput name="fxRegNo" label="FX Reg No." disabled={isSaving} />
        <FormFieldInput
          name="fxRegDate"
          label="FX Reg Date"
          type="date"
          disabled={isSaving}
        />
        <FormFieldInput
          name="fromDate"
          label="From Date"
          type="date"
          disabled={isSaving}
        />
        <FormFieldInput
          name="toDate"
          label="To Date"
          type="date"
          disabled={isSaving}
        />
        <FormFieldInput
          name="aeonLicNo"
          label="AEON Lic No."
          disabled={isSaving}
        />
        <FormFieldInput name="website" label="Website" disabled={isSaving} />
        <FormFieldInput
          name="emailId"
          label="Email ID"
          type="email"
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
