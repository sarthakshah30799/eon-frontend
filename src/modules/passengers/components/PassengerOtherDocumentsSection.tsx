import { useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui';
import {
  FormFieldDatePicker,
  FormFieldFileUploader,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import { usePassengerOtherDocumentTypes } from '../hooks';
import { shouldShowPassengerOtherDocumentValidityFields } from '../utils/passengerOtherDocumentRules';

interface PassengerOtherDocumentsSectionProps {
  onDocumentChange?: () => void;
  description?: string;
}

export const PassengerOtherDocumentsSection = ({
  onDocumentChange,
  description = 'Add any supporting passenger documents you want to capture.',
}: PassengerOtherDocumentsSectionProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const { errors } = useFormState({
    control: form.control,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'otherDocuments',
  });
  const watchedOtherDocuments = useWatch({
    control: form.control,
    name: 'otherDocuments',
  });
  const { data: documentTypes = [], loadOptions } = usePassengerOtherDocumentTypes();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Other Documents
          </h3>
          <p className="text-sm text-text-secondary">
            {description}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            append({
              documentType: '',
              documentNumber: '',
              validTill: '',
              issueAt: '',
              issueDate: '',
              expiryDate: '',
              documentFile: '',
            });
            onDocumentChange?.();
          }}
        >
          Add Document
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const documentType = watchedOtherDocuments?.[index]?.documentType ?? '';

          return (
            <div
              key={field.id}
              className="rounded-sm border border-border-primary bg-surface-secondary p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-text-primary">
                  Document {index + 1}
                </div>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      remove(index);
                      onDocumentChange?.();
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormFieldSelect
                  name={`otherDocuments.${index}.documentType`}
                  label="Type of ID"
                  placeholder="Select document type"
                  loadOptions={loadOptions}
                  defaultOptions={documentTypes}
                  onValueChange={value => {
                    if (Array.isArray(value)) {
                      return;
                    }

                    const hiddenFieldNames = [
                      `otherDocuments.${index}.validTill`,
                      `otherDocuments.${index}.issueAt`,
                      `otherDocuments.${index}.issueDate`,
                      `otherDocuments.${index}.expiryDate`,
                    ] as const;

                    if (shouldShowPassengerOtherDocumentValidityFields(value)) {
                      hiddenFieldNames.forEach(fieldName => {
                        form.clearErrors(fieldName as never);
                      });
                      onDocumentChange?.();
                      return;
                    }

                    hiddenFieldNames.forEach(fieldName => {
                      const currentValue = form.getValues(fieldName);
                      if (currentValue === '') {
                        return;
                      }

                      form.setValue(fieldName as never, '' as never, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: false,
                      });
                      form.clearErrors(fieldName as never);
                    });

                    onDocumentChange?.();
                  }}
                />
                <FormFieldInput
                  name={`otherDocuments.${index}.documentNumber`}
                  label="ID Number"
                  placeholder="Enter ID number"
                  onBlur={onDocumentChange}
                />
                {shouldShowPassengerOtherDocumentValidityFields(documentType) ? (
                  <FormFieldDatePicker
                    name={`otherDocuments.${index}.validTill`}
                    label="Valid Till"
                    placeholder="Select expiry date"
                    onBlur={onDocumentChange}
                  />
                ) : null}
                <div className="md:col-span-2">
                  <FormFieldFileUploader
                    name={`otherDocuments.${index}.documentFile`}
                    label="Upload Document"
                    placeholder="Choose file"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errors.otherDocuments ? (
        <div className="rounded-sm border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {(errors.otherDocuments as { root?: { message?: string }; message?: string })
            .root?.message ||
            (errors.otherDocuments as { message?: string }).message ||
            'At least one other document is required'}
        </div>
      ) : null}
    </div>
  );
};
