import { useCallback } from 'react';
import { Button } from '@/components/ui/button1';
import {
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
  FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { AsyncSelectResponse } from '@/components/ui';
import { usePartyProfileTypes } from '@/modules/partyProfiles/hooks';
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
  const { data: typeOptions = [] } = usePartyProfileTypes();

  const groupOptions = typeOptions.map(option => ({
    value: option.label,
    label: option.label,
  }));

  const loadGroupOptions = useCallback(async (): Promise<AsyncSelectResponse> => {
    return { options: groupOptions };
  }, [groupOptions]);

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
          isMulti
        />
        <FormFieldInput
          name={`rules.${index}.maxSizeMb`}
          label="Max Size (MB)"
          type="number"
          placeholder="5"
          disabled={isSubmitting}
        />
        <FormFieldSelect
          name={`rules.${index}.groupSelection`}
          label="Group"
          placeholder="Select group"
          loadOptions={loadGroupOptions}
          defaultOptions={groupOptions}
          disabled={isSubmitting}
          isSearchable={false}
        />
        <FormFieldCategoryOption
          name={`rules.${index}.entitySelection`}
          label="Entity Type"
          code={CategoryOptionCodeEnum.EntityType}
          placeholder="Select entity type"
          disabled={isSubmitting}
          isCreatable={true}
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
