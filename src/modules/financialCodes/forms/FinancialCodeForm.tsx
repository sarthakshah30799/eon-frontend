import type { SubmitErrorHandler, Resolver } from 'react-hook-form';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldInput,
  FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { financialCodeSchema } from '../schema/financialCodeSchema';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import type { ICreateFinancialCode } from '../types/financialCodeTypes';
import { useNavigate } from 'react-router-dom';

interface FinancialCodeFormProps {
  defaultValues: ICreateFinancialCode;
  onSubmit: (values: ICreateFinancialCode) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

const SubProfilesFieldArray = ({ isDisabled }: { isDisabled: boolean }) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subProfiles',
  });

  return (
    <div className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Financial Sub Profiles
        </h3>
        {!isDisabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                financialSubCode: '',
                financialSubName: '',
                priority: 0,
              })
            }
            className="flex items-center gap-1.5"
          >
            <PlusIcon className="h-4 w-4" />
            Add Sub Profile
          </Button>
        )}
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 text-sm text-text-secondary">
          No sub profiles added yet. Click "Add Sub Profile" to add one.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_120px_48px] gap-4 px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <div>Sub Code</div>
            <div>Sub Name</div>
            <div>Priority</div>
            <div></div>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_120px_48px] gap-4 items-start p-3 md:p-2 rounded-sm border border-border-secondary md:border-none bg-surface-primary md:bg-transparent"
              >
                <div>
                  <span className="block md:hidden text-xs font-semibold text-text-secondary mb-1">
                    Sub Code
                  </span>
                  <FormFieldInput
                    name={`subProfiles.${index}.financialSubCode`}
                    placeholder="e.g. HDFCA"
                    disabled={isDisabled}
                  />
                </div>
                <div>
                  <span className="block md:hidden text-xs font-semibold text-text-secondary mb-1">
                    Sub Name
                  </span>
                  <FormFieldInput
                    name={`subProfiles.${index}.financialSubName`}
                    placeholder="e.g. HDFC CURRENT A/C"
                    disabled={isDisabled}
                  />
                </div>
                <div>
                  <span className="block md:hidden text-xs font-semibold text-text-secondary mb-1">
                    Priority
                  </span>
                  <FormFieldInput
                    name={`subProfiles.${index}.priority`}
                    type="number"
                    placeholder="0"
                    disabled={isDisabled}
                  />
                </div>
                <div className="flex md:justify-center md:items-center mt-2 md:mt-0">
                  {!isDisabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-error-600 hover:bg-error-50 hover:text-error-700 h-9 w-9 rounded-sm"
                      onClick={() => remove(index)}
                      aria-label="Remove sub profile"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const FinancialCodeForm = ({
  defaultValues,
  onSubmit,
  submitLabel = FINANCIAL_CODE_TEXTS.CREATE_CODE,
  isSubmitting = false,
  readOnly = false,
}: FinancialCodeFormProps) => {
  const navigate = useNavigate();

  const handleSubmitErrors: SubmitErrorHandler<
    ICreateFinancialCode
  > = errors => {
    console.log('FinancialCodeForm submit errors:', errors);
  };

  const isDisabled = isSubmitting || readOnly;
  const onCancel = () => {
    navigate('/admin/financial-profile');
  };
  return (
    <Form
      id='financial-profile-form'
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={
        yupResolver(financialCodeSchema) as Resolver<ICreateFinancialCode>
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
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldCategoryOption
          name="financialType"
          label="Financial Type"
          code={CategoryOptionCodeEnum.FinancialType}
          placeholder="Select financial type"
          disabled={isDisabled}
          useValueAsId={true}
        />
        <FormFieldInput
          name="financialCode"
          label="Financial Code"
          placeholder="e.g. BANKBL"
          disabled={isDisabled}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="financialName"
          label="Financial Name"
          placeholder="e.g. BANK BALANCES"
          disabled={isDisabled}
        />
        <FormFieldCategoryOption
          name="defaultSign"
          label="Default Sign"
          code={CategoryOptionCodeEnum.DefaultSign}
          placeholder="Select default sign"
          disabled={isDisabled}
          useValueAsId={true}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="priority"
          label="Priority"
          type="number"
          placeholder="e.g. 1"
          disabled={isDisabled}
        />
      </div>

      <SubProfilesFieldArray isDisabled={isDisabled} />
    </Form>
  );
};
export default FinancialCodeForm;
