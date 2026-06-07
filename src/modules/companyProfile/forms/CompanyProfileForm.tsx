import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormFieldFileUploader,
  FormFieldInput,
} from '@/components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import { companyProfileSchema } from '../schema';
import type { ICreateCompanyProfile } from '../types';

interface CompanyProfileFormProps {
  defaultValues: ICreateCompanyProfile;
  onSubmit: (values: ICreateCompanyProfile) => void | Promise<void>;
  isSaving?: boolean;
}
const COMPANY_FORM_ID = 'company-profile-form';
export const CompanyProfileForm = ({
  defaultValues,
  onSubmit,
  isSaving = false,
}: CompanyProfileFormProps) => {
  const navigate = useNavigate();
  return (
    <Form
      id={COMPANY_FORM_ID}
      onSubmit={onSubmit}
      resolver={yupResolver(companyProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel: 'Save Changes',
        onCancel: () => navigate('/admin/company-profile'),
        onBackClick: () => navigate('/admin/company-profile'),
      }}
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
        <FormFieldInput name="name" label="Name" disabled={isSaving} />
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
          name="email"
          label="Email"
          type="email"
          disabled={isSaving}
        />
      </div>
    </Form>
  );
};
