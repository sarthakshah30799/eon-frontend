import type { SubmitErrorHandler, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import { countryProfileSchema } from '../schema';
import { COUNTRY_PROFILE_TEXTS, riskCategoryOptions } from '../constants';
import type { ICreateCountryProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { countryGroupApi } from '@/api';

const loadRiskCategoryOptions = async (): Promise<AsyncSelectResponse> => {
  return { options: riskCategoryOptions };
};

const loadCountryGroupOptions = async (inputValue: string): Promise<AsyncSelectResponse> => {
  try {
    const groups = await countryGroupApi.getCountryGroups();
    const options = groups
      .filter(g => g.name.toLowerCase().includes(inputValue.toLowerCase()))
      .map(g => ({
        value: g.id,
        label: g.name,
      }));
    return { options };
  } catch (error) {
    console.error('Failed to load country groups:', error);
    return { options: [] };
  }
};

interface CountryProfileFormProps {
  defaultValues: ICreateCountryProfile;
  onSubmit: (values: ICreateCountryProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export const CountryProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY,
  isSubmitting = false,
  readOnly = false,
}: CountryProfileFormProps) => {
  const navigate = useNavigate();

  const handleSubmitErrors: SubmitErrorHandler<
    ICreateCountryProfile
  > = errors => {
    console.log('CountryProfileForm submit errors:', errors);
  };

  const handleCreateCountryGroup = async (inputValue: string) => {
    try {
      const newGroup = await countryGroupApi.createCountryGroup({ name: inputValue });
      return {
        value: newGroup.id,
        label: newGroup.name,
      };
    } catch (error) {
      console.error('Failed to create country group:', error);
      throw error;
    }
  };

  const isDisabled = isSubmitting || readOnly;
  const onCancel = () => {
    navigate('/master/system-setups/user-profile');
  };
  return (
    <Form
      id="country-profile-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(countryProfileSchema) as Resolver<ICreateCountryProfile>}
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
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="code"
          label="Country Code"
          disabled={isDisabled}
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
          isSearchable={false}
        />
        <FormFieldSelect
          name="countryGroupId"
          label="Country Group"
          loadOptions={loadCountryGroupOptions}
          placeholder="Select country group"
          disabled={isDisabled}
          isClearable
          isSearchable={true}
          isCreatable={true}
          onCreateOption={handleCreateCountryGroup}
        />
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
    </Form>
  );
};
