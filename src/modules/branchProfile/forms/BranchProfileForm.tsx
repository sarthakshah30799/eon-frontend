import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldCheckbox,
  FormFieldCountryDropdown,
  FormFieldInput,
  FormFieldSelect,
  FormFieldStateDropdown,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { branchProfileSchema } from '../schema';
import type { ICreateBranchProfile, IBranchProfileOption } from '../types';
import { useListCounterProfiles } from '@/modules/counterProfile/hooks';

interface BranchProfileFormProps {
  defaultValues: ICreateBranchProfile;
  onSubmit: (values: ICreateBranchProfile) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  branchAttachedToOptions?: IBranchProfileOption[];
  tone?: 'default' | 'review';
}

const getFormCardClass = (tone: 'default' | 'review') =>
  tone === 'review'
    ? 'rounded-xl border border-sky-100 bg-white p-3 shadow-none'
    : 'rounded-xl border border-sky-100 bg-white p-3 shadow-none';

const getFieldClassName = (tone: 'default' | 'review') =>
  tone === 'review'
    ? '!rounded-md !border-slate-200 !bg-slate-50 !shadow-none !text-slate-900 placeholder:text-slate-400 focus:!border-[var(--branch-accent)] focus:!ring-[var(--branch-accent)]'
    : '';

const getSelectClassName = (tone: 'default' | 'review') =>
  tone === 'review' ? 'ui-review-flat-select' : '';

const getCheckboxClassName = (tone: 'default' | 'review') =>
  tone === 'review'
    ? 'items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3'
    : '';

const createStaticLoadOptions = (options: { value: string; label: string }[]) => {
  return async () => ({
    options,
    hasMore: false,
  });
};

const BRANCH_THEME_ACCENT = 'oklch(0.5 0.134 242.749)';
const BRANCH_FORM_ID = 'branch-profile-form';

const BranchSectionHeading = ({ children }: { children: string }) => (
  <h2 className="mb-3 flex items-start gap-3 text-sm font-semibold uppercase text-black">
    <span
      className="mt-1 h-3 w-1 rounded-full"
      style={{ backgroundColor: BRANCH_THEME_ACCENT }}
      aria-hidden="true"
    />
    <span>{children}</span>
  </h2>
);

const BranchProfileFormFields = ({
  isSubmitting = false,
  tone = 'default',
}: {
  isSubmitting?: boolean;
  tone?: 'default' | 'review';
}) => {
  const form = useFormContext<ICreateBranchProfile>();
  const countryId = useWatch({
    control: form.control,
    name: 'countryId',
  });
  const previousCountryIdRef = useRef<string>(countryId);
  const {
    data: counterProfiles = [],
    isLoading: isCountersLoading,
    isFetching: isCountersFetching,
  } = useListCounterProfiles();

  useEffect(() => {
    if (previousCountryIdRef.current !== countryId) {
      form.setValue('stateId', '');
      previousCountryIdRef.current = countryId;
    }
  }, [countryId, form]);

  const connectedCounterOptions = useMemo(
    () =>
      counterProfiles.map(counter => ({
        value: counter.id,
        label: `${counter.counterNo} - ${counter.name}`,
      })),
    [counterProfiles]
  );
  const connectedCounterLoadOptions = useMemo(
    () => createStaticLoadOptions(connectedCounterOptions),
    [connectedCounterOptions]
  );

  return (
    <div
      className="space-y-3 pb-24"
      style={{ '--branch-accent': BRANCH_THEME_ACCENT } as CSSProperties}
    >
      <section className={getFormCardClass(tone)}>
        <BranchSectionHeading>Basic Details</BranchSectionHeading>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="code"
            label="Branch Code"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="name"
            label="Branch Name"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="branchNumber"
            label="Branch Number"
            type="number"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="city"
            label="City"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldCountryDropdown
            name="countryId"
            label="Country"
            placeholder="Select country"
            disabled={isSubmitting}
            className={getSelectClassName(tone)}
          />
          <FormFieldStateDropdown
            name="stateId"
            label="State"
            placeholder={countryId ? 'Select state' : 'Select country first'}
            countryId={countryId}
            disabled={isSubmitting || !countryId}
            className={getSelectClassName(tone)}
          />
          <FormFieldCategoryOption
            name="locationType"
            label="Location Type"
            code={CategoryOptionCodeEnum.LocationType}
            placeholder="Select location type"
            disabled={isSubmitting}
            className={getSelectClassName(tone)}
          />
        </div>
      </section>

      <section className={getFormCardClass(tone)}>
        <BranchSectionHeading>Address Details</BranchSectionHeading>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="address1"
            label="Address Line 1"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="address2"
            label="Address Line 2"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="address3"
            label="Address Line 3"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="gstState"
            label="GST State"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="pinCode"
            label="Pincode"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
        </div>
      </section>

      <section className={getFormCardClass(tone)}>
        <BranchSectionHeading>Contact Details</BranchSectionHeading>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="contactName"
            label="Contact Name"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="contactNo"
            label="Contact No."
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="branchEmail"
            label="Branch Email"
            type="email"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="aeonBranchLic"
            label="AEON Branch Lic"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
        </div>
      </section>

      <section className={getFormCardClass(tone)}>
        <BranchSectionHeading>Tax & Finance</BranchSectionHeading>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="gstNo"
            label="GST No."
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="fxRegNo"
            label="FX Reg No."
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="fxRegDate"
            label="FX Reg Date"
            type="date"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="cashHolding"
            label="Cash Holding"
            type="number"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="cashHoldingTemp"
            label="Cash Holding Temp"
            type="number"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="currHolding"
            label="Currency Holding"
            type="number"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
          <FormFieldInput
            name="currHoldingTemp"
            label="Currency Holding Temp"
            type="number"
            disabled={isSubmitting}
            className={getFieldClassName(tone)}
          />
        </div>
      </section>

      <section className={getFormCardClass(tone)}>
        <BranchSectionHeading>Relations & Status</BranchSectionHeading>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldSelect
            name="connectCounterIds"
            label="Connect Counters"
            placeholder="Select counters to link"
            loadOptions={connectedCounterLoadOptions}
            pagination={false}
            isLoading={isCountersLoading || isCountersFetching}
            defaultOptions={connectedCounterOptions}
            disabled={isSubmitting}
            isMulti
            closeMenuOnSelect={false}
            className={[
              'md:col-span-2 lg:col-span-4',
              getSelectClassName(tone),
            ].join(' ')}
          />
          <div className="mt-2 grid gap-2 md:col-span-2 md:grid-cols-2 lg:col-span-4">
            <FormFieldCheckbox
              name="isHeadOffice"
              label="Is Head Office"
              disabled={isSubmitting}
              className={getCheckboxClassName(tone)}
            />
            <FormFieldCheckbox
              name="isActive"
              label="Is Active"
              disabled={isSubmitting}
              className={getCheckboxClassName(tone)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const BranchProfileSubmitBar = ({
  submitLabel,
  cancelLabel,
  onCancel,
  isSubmitting,
}: {
  submitLabel: string;
  cancelLabel: string;
  onCancel?: () => void | Promise<void>;
  isSubmitting: boolean;
}) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:left-[var(--app-sidebar-offset)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="!rounded-xl px-4 py-2"
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          form={BRANCH_FORM_ID}
          variant="accent"
          disabled={isSubmitting}
          className="!rounded-xl px-4 py-2"
          style={{ '--button-accent': BRANCH_THEME_ACCENT } as CSSProperties}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>,
    document.body
  );
};

export const BranchProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  isSubmitting = false,
  tone = 'default',
}: BranchProfileFormProps) => {
  return (
    <>
      <Form
        id={BRANCH_FORM_ID}
        onSubmit={onSubmit}
        resolver={yupResolver(branchProfileSchema) as Resolver<ICreateBranchProfile>}
        defaultValues={defaultValues}
        className={tone === 'review' ? 'space-y-4' : 'space-y-6'}
      >
        <BranchProfileFormFields isSubmitting={isSubmitting} tone={tone} />
      </Form>
      <BranchProfileSubmitBar
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
