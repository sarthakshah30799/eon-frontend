import { useCallback, useState } from 'react';
import type { SubmitErrorHandler, Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import { Button } from '@/components/ui/button1';
import type { AsyncSelectResponse } from '@/components/ui';
import { countryProfileSchema } from '../schema';
import { COUNTRY_PROFILE_TEXTS, riskCategoryOptions } from '../constants';
import type { ICreateCountryProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { CountryGroupModal } from '../components';
import { countryProfileApi } from '@/api/countryProfile';
import { countryGroupApi } from '@/api/countryGroup';
import { normalizeCodeValue } from '@/utils';
import { usePermission } from '@/hooks';
import { CountryAccessRulesSection } from '../components';

const loadRiskCategoryOptions = async (
  inputValue: string
): Promise<AsyncSelectResponse> => {
  if (!inputValue) return { options: riskCategoryOptions };
  const filtered = riskCategoryOptions.filter(opt =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );
  return { options: filtered };
};

const CountryGroupField = ({ isDisabled }: { isDisabled: boolean }) => {
  const { setValue } = useFormContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingGroupName, setPendingGroupName] = useState('');
  const { canAdd } = usePermission('/admin/country-group');

  const loadCountryGroupOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const groups = await countryGroupApi.getCountryGroups(inputValue);
      return {
        options: groups.map(group => ({
          value: group.id,
          label: group.name,
        })),
      };
    },
    []
  );

  const handleSuccess = (newGroupId: string) => {
    setValue('countryGroupId', newGroupId, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="w-full">
      <FormFieldSelect
        name="countryGroupId"
        label="Country Group"
        loadOptions={loadCountryGroupOptions}
        placeholder="Select country group"
        disabled={isDisabled}
        isClearable
        isSearchable={true}
        isCreatable={canAdd}
        onCreateOption={inputValue => {
          if (!canAdd) {
            return;
          }
          setPendingGroupName(inputValue);
          setIsModalOpen(true);
        }}
      />

      <CountryGroupModal
        key={`${isModalOpen ? 'open' : 'closed'}-${pendingGroupName}`}
        open={isModalOpen}
        onOpenChange={open => {
          setIsModalOpen(open);

          if (!open) {
            setPendingGroupName('');
          }
        }}
        onSuccess={handleSuccess}
        initialName={pendingGroupName}
      />
    </div>
  );
};

interface CountryProfileFormFieldsProps {
  isDisabled: boolean;
  currentId?: string;
}

const CountryProfileFormFields = ({
  isDisabled,
  currentId,
}: CountryProfileFormFieldsProps) => {
  const form = useFormContext<ICreateCountryProfile>();
  const isBlocked = useWatch({
    control: form.control,
    name: 'isBlocked',
  }) as boolean | undefined;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="code"
          label="Country Code"
          disabled={isDisabled || Boolean(currentId)}
          asyncValidation={{
            enabled: !isDisabled,
            check: async value => {
              const normalizedCode = normalizeCodeValue(value);
              if (!normalizedCode) {
                return false;
              }

              const res = await countryProfileApi.getCountryProfiles({
                page: 1,
                limit: 20,
                code: normalizedCode,
              });

              return (res.data ?? []).some(
                country =>
                  normalizeCodeValue(country.code) === normalizedCode &&
                  country.id !== currentId
              );
            },
            message: 'Country code already exists',
            normalize: normalizeCodeValue,
          }}
        />
        <FormFieldInput
          name="name"
          label="Country Name"
          disabled={isDisabled}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="lrsCountryCode"
          label="LRS Country Code"
          disabled={isDisabled}
        />
        <FormFieldInput
          name="ctrCountryCode"
          label="CTR Country Code"
          disabled={isDisabled}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldSelect
          name="riskCategory"
          label="Risk Category"
          defaultOptions={riskCategoryOptions}
          loadOptions={loadRiskCategoryOptions}
          placeholder="Select risk category"
          disabled={isDisabled}
          isClearable
        />
        <CountryGroupField isDisabled={isDisabled} />
      </div>

      <div className="grid gap-3 rounded-sm border border-border-primary bg-surface-secondary p-4 sm:grid-cols-3">
        <FormFieldCheckbox
          name="restrictedCountry"
          label="Restricted Country"
          disabled={isDisabled}
        />
        <FormFieldCheckbox
          name="greyListCountry"
          label="Grey List Country"
          disabled={isDisabled}
        />
        <FormFieldCheckbox
          name="baseCountry"
          label="Base Country"
          disabled={isDisabled}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldCheckbox
          name="isBlocked"
          label="Blocked Country"
          disabled={isDisabled}
        />
        <FormFieldInput
          name="blockedReason"
          label="Blocked Reason"
          placeholder="Optional reason for blocking this country"
          disabled={isDisabled}
        />
      </div>

      {currentId ? (
        <CountryAccessRulesSection
          countryId={currentId}
          countryBlocked={Boolean(isBlocked)}
        />
      ) : null}
    </>
  );
};

interface CountryProfileFormProps {
  defaultValues: ICreateCountryProfile;
  onSubmit: (values: ICreateCountryProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  insideModal?: boolean;
  currentId?: string;
}

export const CountryProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY,
  isSubmitting = false,
  readOnly = false,
  insideModal = false,
  currentId,
}: CountryProfileFormProps) => {
  const navigate = useNavigate();

  const handleSubmitErrors: SubmitErrorHandler<
    ICreateCountryProfile
  > = errors => {
    console.log('CountryProfileForm submit errors:', errors);
  };

  const isDisabled = isSubmitting || readOnly;
  const onCancel = () => {
    navigate('/admin/country-profile');
  };
  return (
    <Form
      id={insideModal ? '' : 'country-profile-form'}
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={
        yupResolver(countryProfileSchema) as Resolver<ICreateCountryProfile>
      }
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <CountryProfileFormFields isDisabled={isDisabled} currentId={currentId} />

      {!readOnly && insideModal && (
        <div className="flex justify-end border-t border-border-primary pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      )}
    </Form>
  );
};
