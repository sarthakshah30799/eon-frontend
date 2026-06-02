import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
  FormFieldPassword,
} from '@/components/forms';
import type { ICreateUserProfile } from '../types';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import { userProfileSchema } from '../schema';
import { userRoleApi, branchProfileApi, counterProfileApi } from '@/api';

interface UserProfileFormProps {
  defaultValues: ICreateUserProfile;
  onSubmit: (values: ICreateUserProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const formCardClass = 'rounded-sm border border-border-primary bg-surface-secondary p-5 space-y-4';
const sectionHeaderClass = 'text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary border-b border-border-primary pb-2 mb-4';

const createStaticLoadOptions = (options: { value: string; label: string }[]) => {
  return async () => ({
    options,
    hasMore: false,
  });
};

const UserProfileFormFields = ({
  isSubmitting,
  isEdit,
  submitLabel,
}: {
  isSubmitting: boolean;
  isEdit: boolean;
  submitLabel: string;
}) => {
  const { watch, setValue } = useFormContext();
  const selectedBranchId = watch('branchId');
  const selectedRoleId = watch('roleId');

  // Load backend data dynamically
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userRoleApi.getUserRoles(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchProfileApi.getBranchProfiles(),
  });

  const { data: counters = [] } = useQuery({
    queryKey: ['counters'],
    queryFn: () => counterProfileApi.getCounterProfiles(),
  });

  // Automatically update userGroupCode when role changes
  useEffect(() => {
    if (selectedRoleId && roles.length > 0) {
      const selectedRole = roles.find(r => r.id === selectedRoleId);
      if (selectedRole) {
        setValue('userGroupCode', selectedRole.userGroupCode);
      }
    }
  }, [selectedRoleId, roles, setValue]);

  // Automatically update branchCode when branch changes
  useEffect(() => {
    if (selectedBranchId && branches.length > 0) {
      const selectedBranch = branches.find(b => b.id === selectedBranchId);
      if (selectedBranch) {
        setValue('branchCode', selectedBranch.branchCode);
      }
    } else if (!selectedBranchId) {
      setValue('branchCode', '');
    }
  }, [selectedBranchId, branches, setValue]);

  // Automatically reset counter if branch changes
  useEffect(() => {
    if (selectedBranchId) {
      const selectedBranch = branches.find(b => b.id === selectedBranchId);
      const connectedCounterIds = selectedBranch?.connectCounterIds || [];
      const currentCounterId = watch('counterId');
      const counterIsValid = connectedCounterIds.includes(currentCounterId);
      if (!counterIsValid) {
        setValue('counterId', '');
      }
    } else {
      setValue('counterId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, setValue, counters, branches]);

  const branchLoadOptions = useMemo(() => {
    const opts = branches.map(b => ({
      value: b.id,
      label: b.branchCode,
    }));
    return createStaticLoadOptions(opts);
  }, [branches]);

  const roleLoadOptions = useMemo(() => {
    const opts = roles.map(r => ({
      value: r.id,
      label: r.userGroupName || r.userGroupCode,
    }));
    return createStaticLoadOptions(opts);
  }, [roles]);

  const counterLoadOptions = useMemo(() => {
    if (!selectedBranchId) return createStaticLoadOptions([]);
    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return createStaticLoadOptions([]);

    const connectedCounterIds = selectedBranch.connectCounterIds || [];
    const filtered = counters.filter(c => connectedCounterIds.includes(c.id));
    const opts = filtered.map(c => ({
      value: c.id,
      label: c.counterName || `Counter ${c.counterNo}`,
    }));
    return createStaticLoadOptions(opts);
  }, [counters, branches, selectedBranchId]);

  return (
    <div className="space-y-6">
      {/* 1. Identity & Credentials */}
      <section className={formCardClass}>
        <h2 className={sectionHeaderClass}>Identity & Credentials</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput
            name="userCode"
            label="User Code"
            disabled={isSubmitting || isEdit}
            placeholder="e.g. ADM001"
          />
          <FormFieldInput
            name="userName"
            label="User Name"
            disabled={isSubmitting}
            placeholder="Full Name"
          />
          <FormFieldPassword
            name="password"
            label="Password"
            disabled={isSubmitting}
            placeholder={isEdit ? "Leave empty to keep current password" : "Enter password"}
          />
        </div>
      </section>

      {/* 2. Associations */}
      <section className={formCardClass}>
        <h2 className={sectionHeaderClass}>Roles & Workplace Associations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <FormFieldSelect
              name="roleId"
              label="User Role / Group"
              placeholder="Select Role"
              loadOptions={roleLoadOptions}
              pagination={false}
              disabled={isSubmitting}
            />
          </div>
          <FormFieldInput
            name="userGroupCode"
            label="User Group Code"
            disabled={true}
            placeholder="Auto-populated on role select"
          />
          <div className="hidden lg:block" /> {/* Alignment spacer */}

          <div className="space-y-2">
            <FormFieldSelect
              name="branchId"
              label="Associated Branch"
              placeholder="Select Branch"
              loadOptions={branchLoadOptions}
              pagination={false}
              disabled={isSubmitting}
            />
          </div>
          <FormFieldInput
            name="branchCode"
            label="Branch Code"
            disabled={true}
            placeholder="Auto-populated on branch select"
          />
          <div className="space-y-2">
            <FormFieldSelect
              name="counterId"
              label="Associated Counter"
              placeholder={selectedBranchId ? "Select Counter" : "Please select associated branch first"}
              loadOptions={counterLoadOptions}
              pagination={false}
              disabled={isSubmitting || !selectedBranchId}
            />
          </div>
        </div>
      </section>

      {/* 3. ERP Profile Details */}
      <section className={formCardClass}>
        <h2 className={sectionHeaderClass}>ERP Details & Contact</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput
            name="emailId"
            label="Email ID"
            type="email"
            disabled={isSubmitting}
            placeholder="e.g. sarthak@example.com"
          />
          <FormFieldInput
            name="contactNo"
            label="Contact No."
            disabled={isSubmitting}
            placeholder="Phone Number"
          />
          <FormFieldInput
            name="employeeNo"
            label="Employee No."
            disabled={isSubmitting}
            placeholder="e.g. EMP100"
          />
          <FormFieldInput
            name="designation"
            label="Designation"
            disabled={isSubmitting}
            placeholder="e.g. Regional Manager"
          />
          <FormFieldInput
            name="userLicNo"
            label="User License No."
            disabled={isSubmitting}
            placeholder="e.g. LIC-2900"
          />
        </div>
      </section>

      {/* 4. Controls & Setup */}
      <section className={formCardClass}>
        <h2 className={sectionHeaderClass}>Account Controls</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormFieldCheckbox
            name="isActive"
            label="Active Account"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isLocked"
            label="Locked"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDormant"
            label="Dormant"
            disabled={isSubmitting}
          />
        </div>
      </section>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>
  );
};

export const UserProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Create User',
  isSubmitting = false,
}: UserProfileFormProps) => {
  const isEdit = !!defaultValues.userCode;

  return (
    <Form
      onSubmit={onSubmit}
      resolver={
        yupResolver(userProfileSchema, { context: { isEdit } }) as Resolver<ICreateUserProfile>
      }
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <UserProfileFormFields
        isSubmitting={isSubmitting}
        isEdit={isEdit}
        submitLabel={submitLabel}
      />
    </Form>
  );
};
