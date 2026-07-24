import { useFieldArray, useFormContext } from 'react-hook-form';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Button, CardSection } from '@/components/ui';
import { Form, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import { TransactionTypeEnum } from '@/modules/transactions';
import { purposeSchema } from '../schema/purposeSchema';
import { PURPOSE_RATE_TYPE_OPTIONS, PURPOSE_TEXTS } from '../constants/purposeConstants';
import type { ICreatePurpose } from '../types/purposeTypes';
import { createEmptyPurposeFormValues } from '../utils/purposeUtils';

const createStaticLoadOptions = (options: AsyncSelectOption[]) => async (): Promise<AsyncSelectResponse> => ({
  options,
});

const rateTypeOptions: AsyncSelectOption[] = PURPOSE_RATE_TYPE_OPTIONS.map(option => ({
  value: option.value,
  label: option.label,
}));

const transactionTypeOptions: AsyncSelectOption[] = Object.values(TransactionTypeEnum).map(value => ({
  value,
  label: value === TransactionTypeEnum.SALE ? 'Sale' : 'Purchase',
}));

const loadRateTypeOptions = createStaticLoadOptions(rateTypeOptions);
const loadTransactionTypeOptions = createStaticLoadOptions(transactionTypeOptions);

const PurposeSlabsSection = ({
  isSubmitting,
}: {
  isSubmitting: boolean;
}) => {
  const form = useFormContext<ICreatePurpose>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'slabs',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{PURPOSE_TEXTS.SLABS_TITLE}</p>
          <p className="text-xs text-text-tertiary">{PURPOSE_TEXTS.SLABS_SUBTITLE}</p>
        </div>
          <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={() =>
            append({
              sortOrder: fields.length + 1,
              fromAmount: 0,
              toAmount: null,
              rate: 0,
              rateType: 'PERCENT',
            })
          }
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {PURPOSE_TEXTS.ADD_SLAB}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary px-4 py-6 text-sm text-text-secondary">
            No slab rows yet. Add a slab if this purpose uses brackets.
          </div>
        ) : null}

        {fields.map((field, index) => (
          <div key={field.id} className="relative rounded-sm border border-border-primary bg-surface-secondary p-4">
            <Button
              type="button"
              aria-label={`Remove slab ${index + 1}`}
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 rounded-full border border-border-primary bg-surface-primary text-text-tertiary transition hover:border-error-500 hover:bg-error-50 hover:text-error-600 disabled:opacity-50"
              disabled={isSubmitting}
              onClick={() => remove(index)}
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <FormFieldInput
                name={`slabs.${index}.sortOrder`}
                label={`Sort Order ${index + 1}`}
                type="number"
                step="1"
                valueTransform="none"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name={`slabs.${index}.fromAmount`}
                label="From Amount"
                type="number"
                step="any"
                valueTransform="none"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name={`slabs.${index}.toAmount`}
                label="To Amount"
                type="number"
                step="any"
                valueTransform="none"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name={`slabs.${index}.rate`}
                label="Rate"
                type="number"
                step="any"
                valueTransform="none"
                disabled={isSubmitting}
              />
              <FormFieldSelect
                name={`slabs.${index}.rateType`}
                label="Rate Type"
                loadOptions={loadRateTypeOptions}
                defaultOptions={rateTypeOptions}
                isSearchable={false}
                isCreatable={false}
                disabled={isSubmitting}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PurposeFormProps {
  defaultValues: ICreatePurpose;
  onSubmit: (values: ICreatePurpose) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const PurposeForm = ({
  defaultValues,
  onSubmit,
  submitLabel = PURPOSE_TEXTS.SAVE_PURPOSE,
  isSubmitting = false,
}: PurposeFormProps) => {
  const navigate = useNavigate();
  const handleSubmitErrors: SubmitErrorHandler<ICreatePurpose> = errors => {
    console.log('PurposeForm submit errors:', errors);
  };

  return (
    <Form
      id="purpose-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(purposeSchema) as Resolver<ICreatePurpose>}
      defaultValues={{
        ...createEmptyPurposeFormValues(),
        ...defaultValues,
        slabs: defaultValues.slabs ?? [],
      }}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          navigate('/admin/purpose');
        },
        onCancel: () => navigate('/admin/purpose'),
      }}
    >
      <CardSection heading="Purpose Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="code"
            label="Code"
            placeholder="B"
            maxLength={2}
            valueTransform="uppercase"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="description"
            label="Description"
            placeholder="Private Visit"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="threshold"
            label="Threshold"
            type="number"
            step="any"
            valueTransform="none"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="rate"
            label="Rate"
            type="number"
            step="any"
            valueTransform="none"
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="rateType"
            label="Rate Type"
            loadOptions={loadRateTypeOptions}
            defaultOptions={rateTypeOptions}
            isSearchable={false}
            isCreatable={false}
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="transactionType"
            label="Transaction Type"
            loadOptions={loadTransactionTypeOptions}
            defaultOptions={transactionTypeOptions}
            isSearchable={false}
            isCreatable={false}
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading={PURPOSE_TEXTS.SLABS_TITLE}>
        <PurposeSlabsSection isSubmitting={isSubmitting} />
      </CardSection>
    </Form>
  );
};
