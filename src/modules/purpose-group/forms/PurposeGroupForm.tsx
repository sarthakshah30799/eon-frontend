import { useMemo } from 'react';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import { Form, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import { useListPurposes } from '@/modules/purpose/hooks';
import { PAGINATION_DEFAULTS, PAGINATION_MAX_LIMIT } from '@/constants/paginationConstants';
import { TransactionTypeEnum } from '@/modules/transactions';
import { purposeGroupSchema } from '../schema/purposeGroupSchema';
import {
  PURPOSE_GROUP_PROFILE_TYPE_OPTIONS,
  PURPOSE_GROUP_TEXTS,
} from '../constants/purposeGroupConstants';
import type { ICreatePurposeGroup } from '../types/purposeGroupTypes';
import { createEmptyPurposeGroupFormValues } from '../utils/purposeGroupUtils';

const createStaticLoadOptions =
  (options: AsyncSelectOption[]) =>
  async (inputValue: string): Promise<AsyncSelectResponse> => ({
    options: inputValue
      ? options.filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      : options,
  });

const profileTypeOptions: AsyncSelectOption[] =
  PURPOSE_GROUP_PROFILE_TYPE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
  }));

const loadProfileTypeOptions = createStaticLoadOptions(profileTypeOptions);

interface PurposeGroupFormProps {
  defaultValues: ICreatePurposeGroup;
  onSubmit: (values: ICreatePurposeGroup) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const PurposeGroupForm = ({
  defaultValues,
  onSubmit,
  submitLabel = PURPOSE_GROUP_TEXTS.SAVE_GROUP,
  isSubmitting = false,
}: PurposeGroupFormProps) => {
  const navigate = useNavigate();
  const { data: purposesPage, isLoading: isLoadingPurposes } = useListPurposes(
    {
      transactionType: TransactionTypeEnum.SALE,
      limit: PAGINATION_MAX_LIMIT,
      offset: PAGINATION_DEFAULTS.OFFSET,
    }
  );
  const purposes = purposesPage?.data ?? [];

  const purposeOptions: AsyncSelectOption[] = useMemo(
    () =>
      purposes.map(purpose => ({
        value: purpose.id,
        label: `${purpose.code} - ${purpose.description}`,
      })),
    [purposes]
  );

  const loadPurposeOptions = useMemo(
    () => createStaticLoadOptions(purposeOptions),
    [purposeOptions]
  );

  const handleSubmitErrors: SubmitErrorHandler<
    ICreatePurposeGroup
  > = errors => {
    console.log('PurposeGroupForm submit errors:', errors);
  };

  return (
    <Form
      id="purpose-group-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={
        yupResolver(purposeGroupSchema) as Resolver<ICreatePurposeGroup>
      }
      defaultValues={{
        ...createEmptyPurposeGroupFormValues(),
        ...defaultValues,
        purposeIds: defaultValues.purposeIds ?? [],
      }}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          navigate('/admin/purpose-group');
        },
        onCancel: () => navigate('/admin/purpose-group'),
      }}
    >
      <CardSection heading="Purpose Group Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="name"
            label={PURPOSE_GROUP_TEXTS.NAME}
            placeholder="Public visit"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="title"
            label={PURPOSE_GROUP_TEXTS.TITLE}
            placeholder="Sells for private visit"
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="profileType"
            label={PURPOSE_GROUP_TEXTS.PROFILE_TYPE}
            loadOptions={loadProfileTypeOptions}
            defaultOptions={profileTypeOptions}
            isCreatable={false}
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="sortOrder"
            label={PURPOSE_GROUP_TEXTS.SORT_ORDER}
            placeholder={PURPOSE_GROUP_TEXTS.SORT_ORDER_PLACEHOLDER}
            type="number"
            valueTransform="none"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading={PURPOSE_GROUP_TEXTS.PURPOSES}>
        <FormFieldSelect
          name="purposeIds"
          label={PURPOSE_GROUP_TEXTS.PURPOSES}
          placeholder="Select sell purposes"
          loadOptions={loadPurposeOptions}
          defaultOptions={purposeOptions}
          isMulti
          isLoading={isLoadingPurposes}
          isCreatable={false}
          disabled={isSubmitting}
        />
      </CardSection>
    </Form>
  );
};
