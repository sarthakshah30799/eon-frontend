import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button1';
import type { IDocumentProfileFormValues } from '../types';
import { DocumentProfileRuleRow } from './DocumentProfileRuleRow';
import { createEmptyDocumentProfileRule } from '../utils';

interface DocumentProfileRuleRowsProps {
  isSubmitting: boolean;
}

export const DocumentProfileRuleRows = ({
  isSubmitting,
}: DocumentProfileRuleRowsProps) => {
  const form = useFormContext<IDocumentProfileFormValues>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rules',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Document Rules</p>
          <p className="text-xs text-text-tertiary">
            Add one or more document rules for the profile.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={() => append(createEmptyDocumentProfileRule())}
        >
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <DocumentProfileRuleRow
            key={field.id}
            index={index}
            isSubmitting={isSubmitting}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
    </div>
  );
};

