import { Button } from '@/components/ui/button1';
import {
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  getDocumentTypeOptionItems,
  loadDocumentTypeOptions,
} from '../utils';

interface DocumentProfileRuleRowProps {
  index: number;
  isSubmitting: boolean;
  onRemove: () => void;
  canRemove: boolean;
}

export const DocumentProfileRuleRow = ({
  index,
  isSubmitting,
  onRemove,
  canRemove,
}: DocumentProfileRuleRowProps) => {
  return (
    <div className="relative rounded-sm border border-border-primary bg-surface-secondary p-4">
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-9 w-9 rounded-sm text-error-600 hover:bg-error-50 hover:text-error-700"
          disabled={isSubmitting}
          onClick={onRemove}
          aria-label={`Remove document rule ${index + 1}`}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FormFieldInput
          name={`rules.${index}.documentCode`}
          label="Document Code"
          placeholder="PAN_CARD"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name={`rules.${index}.documentDescription`}
          label="Document Description"
          placeholder="PAN card copy"
          disabled={isSubmitting}
        />
        <FormFieldSelect
          name={`rules.${index}.documentType`}
          label="Document Type"
          placeholder="Select document type"
          loadOptions={loadDocumentTypeOptions}
          defaultOptions={getDocumentTypeOptionItems()}
          disabled={isSubmitting}
          isSearchable={false}
        />
        <FormFieldInput
          name={`rules.${index}.maxSizeMb`}
          label="Max Size (MB)"
          type="number"
          placeholder="5"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name={`rules.${index}.profileSelection`}
          label="Profile Selection"
          placeholder="e.g. MASTER / COMPANY"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name={`rules.${index}.entitySelection`}
          label="Entity Selection"
          placeholder="e.g. OTHER / INDIVIDUAL"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name={`rules.${index}.fieldSelection`}
          label="Field Selection"
          placeholder="e.g. entityType"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name={`rules.${index}.fieldValue`}
          label="Field Value"
          placeholder="e.g. OTHER"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name={`rules.${index}.sortOrder`}
          label="Sort Order"
          type="number"
          disabled={isSubmitting}
        />
        <div className="flex items-end gap-6">
          <FormFieldCheckbox
            name={`rules.${index}.isRequired`}
            label="Required"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name={`rules.${index}.active`}
            label="Active"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
