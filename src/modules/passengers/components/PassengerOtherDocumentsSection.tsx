import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui';
import {
  FormFieldDatePicker,
  FormFieldFileUploader,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import { usePassengerOtherDocumentTypes } from '../hooks';

interface PassengerOtherDocumentsSectionProps {
  onDocumentChange?: () => void;
}

export const PassengerOtherDocumentsSection = ({
  onDocumentChange,
}: PassengerOtherDocumentsSectionProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'otherDocuments',
  });
  const { data: documentTypes = [] } = usePassengerOtherDocumentTypes();
  const loadOptions = useMemo(
    () => async () => ({
      options: documentTypes.map(option => ({
        value: option.value,
        label: option.label,
      })),
    }),
    [documentTypes]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Other Documents
          </h3>
          <p className="text-sm text-text-secondary">
            Add any supporting Indian passenger documents you want to capture.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              documentType: '',
              documentNumber: '',
              validTill: '',
              issueAt: '',
              issueDate: '',
              expiryDate: '',
              documentFile: '',
            })
          }
        >
          Add Document
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
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
                  onClick={() => remove(index)}
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
                onValueChange={() => onDocumentChange?.()}
              />
              <FormFieldInput
                name={`otherDocuments.${index}.documentNumber`}
                label="ID Number"
                placeholder="Enter ID number"
                onBlur={onDocumentChange}
              />
              <FormFieldDatePicker
                name={`otherDocuments.${index}.validTill`}
                label="Valid Till"
                placeholder="Select expiry date"
                onBlur={onDocumentChange}
              />
              <div className="md:col-span-2">
                <FormFieldFileUploader
                  name={`otherDocuments.${index}.documentFile`}
                  label="Upload Document"
                  placeholder="Choose file"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
