import { useMemo } from 'react';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldInput, FormFieldSelect } from '@/components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import { branchProfileSchema } from '../schema';
import type { BranchProfileFormValues } from '../types';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';

interface BranchProfileFormProps {
  defaultValues: BranchProfileFormValues;
  onSubmit: (values: BranchProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const BranchProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Branch',
  isSubmitting = false,
}: BranchProfileFormProps) => {
  const { data: companies = [] } = useListCompanyProfiles();

  const companyLoadOptions = useMemo(() => {
    return async (search: string) => {
      const filtered = companies
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        .map(c => ({ value: c.id, label: c.name }));
      return { options: filtered };
    };
  }, [companies]);

  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(branchProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldSelect
          key={companies.length}
          name="companyId"
          label="Company"
          placeholder="Select company"
          loadOptions={companyLoadOptions}
          pagination={false}
          disabled={isSubmitting}
        />
        <FormFieldInput name="branchCode" label="Branch Code" disabled={isSubmitting} />
        <FormFieldInput name="branchNumber" label="Branch Number" type="number" disabled={isSubmitting} />
        <FormFieldInput name="address1" label="Address Line 1" disabled={isSubmitting} />
        <FormFieldInput name="address2" label="Address Line 2" disabled={isSubmitting} />
        <FormFieldInput name="address3" label="Address Line 3" disabled={isSubmitting} />
        <FormFieldInput name="pincode" label="Pincode" disabled={isSubmitting} />
        <FormFieldInput name="city" label="City" disabled={isSubmitting} />
        <FormFieldInput name="state" label="State" disabled={isSubmitting} />
        <FormFieldInput name="country" label="Country" disabled={isSubmitting} />
        <FormFieldInput name="stateCode" label="State Code (2 Chars)" disabled={isSubmitting} />
        <FormFieldInput name="gstStateCode" label="GST State Code" disabled={isSubmitting} />
        <FormFieldInput name="phoneNumber1" label="Phone Number 1" disabled={isSubmitting} />
        <FormFieldInput name="phoneNumber2" label="Phone Number 2" disabled={isSubmitting} />
        <FormFieldInput name="contactPersonName" label="Contact Person Name" disabled={isSubmitting} />
        <FormFieldInput name="contactPersonPhone" label="Contact Person Phone" disabled={isSubmitting} />
        <FormFieldInput name="operationGroup" label="Operation Group" disabled={isSubmitting} />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
