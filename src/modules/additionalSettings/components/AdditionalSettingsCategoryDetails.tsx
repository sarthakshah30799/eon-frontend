import { useCallback, useMemo, useState } from 'react';
import { AsyncSelect, Button, Checkbox, Input, Modal } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import type {
  IAdditionalSettingCategory,
  IAdditionalSettingSubcategory,
} from '../types';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  getAdditionalSettingCategoryDefinition,
  getAdditionalSettingSubcategoryDefinition,
} from '../registry/additionalSettingsRegistry';
import { formatAccountProfileLabel } from '../utils/additionalSettingsUtils';
import { accountProfileApi } from '@/api/accountProfile';

interface AdditionalSettingsCategoryDetailsProps {
  category: IAdditionalSettingCategory | null;
  onOpenCreateCategory: () => void;
  onOpenEditCategory: (category: IAdditionalSettingCategory) => void;
  onSaveSubcategory: (
    categoryId: string,
    subcategoryId: string,
    values: { description: string; value: string }
  ) => Promise<void>;
}


const CategoryTitleEditor = ({
  category,
  isReadOnly = false,
  onOpenEditCategory,
}: {
  category: IAdditionalSettingCategory;
  isReadOnly?: boolean;
  onOpenEditCategory: (category: IAdditionalSettingCategory) => void;
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-xl font-semibold tracking-tight text-text-primary">
          {category.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-text-secondary">
          {category.code}
        </p>
      </div>

      {!isReadOnly ? (
        <Button
          type="button"
          aria-label="Edit category"
          onClick={() => onOpenEditCategory(category)}
          variant="ghost"
          size="icon"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </Button>
      ) : null}
    </div>
  );
};

const SubcategoryRow = ({
  subcategory,
  categoryCode,
  onEdit,
}: {
  subcategory: IAdditionalSettingSubcategory;
  categoryCode?: string;
  onEdit: (sub: IAdditionalSettingSubcategory) => void;
}) => {
  const subcategoryDefinition = getAdditionalSettingSubcategoryDefinition(
    categoryCode,
    subcategory.code
  );
  const isAccountProfileValue = subcategoryDefinition?.optionsSource === 'account-profile';
  const { data: accountLabel, isFetching } = useQuery({
    queryKey: ['additional-settings-account-label', subcategory.value],
    queryFn: async () => {
      if (!isAccountProfileValue || !subcategory.value) {
        return '';
      }

      const account = await accountProfileApi.getAccountProfileById(subcategory.value);
      return formatAccountProfileLabel(account);
    },
    enabled: isAccountProfileValue && Boolean(subcategory.value),
  });
  const displayValue = isAccountProfileValue
    ? accountLabel || subcategory.value
    : subcategory.value;

  return (
    <tr className="border-t border-border-primary/80 hover:bg-surface-secondary/50">
      <td className="px-4 py-4 text-xs leading-5 text-text-primary">
        {subcategory.description || subcategory.title}
      </td>
      <td className="px-4 py-4 text-xs font-medium leading-5 text-text-primary">
        {isFetching && isAccountProfileValue ? 'Loading...' : displayValue}
      </td>
      <td className="px-4 py-4">
        <Button
          type="button"
          aria-label={`Edit ${subcategory.title}`}
          onClick={() => onEdit(subcategory)}
          variant="ghost"
          size="icon"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </Button>
      </td>
    </tr>
  );
};

interface EditSubcategoryFormProps {
  categoryCode?: string;
  subcategory: IAdditionalSettingSubcategory;
  isPolicyCategory?: boolean;
  onSave: (values: { description: string; value: string }) => Promise<void>;
  onCancel: () => void;
}

const EditSubcategoryForm = ({
  categoryCode,
  subcategory,
  isPolicyCategory = false,
  onSave,
  onCancel,
}: EditSubcategoryFormProps) => {
  const [description, setDescription] = useState(subcategory.description || subcategory.title);
  const [code] = useState(subcategory.code);
  const [categoryType] = useState(subcategory.categoryType || 'text');
  const [value, setValue] = useState(subcategory.value);
  const [valueError, setValueError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isBooleanType = categoryType.toLowerCase() === 'boolean';
  const subcategoryDefinition = getAdditionalSettingSubcategoryDefinition(
    categoryCode,
    subcategory.code
  );
  const isTransactionNumberingCategory =
    categoryCode?.trim().toUpperCase() === 'TRANSACTION_NUMBERING';
  const isRequiredPolicyValue = subcategoryDefinition?.required ?? true;
  const isNumberType = categoryType.toLowerCase() === 'number' || categoryType.toLowerCase() === 'decimal';
  const isDateType = categoryType.toLowerCase() === 'date';
  const isSelectType = categoryType.toLowerCase() === 'select';
  const selectValueOptions = useMemo(
    () =>
      (subcategoryDefinition?.options ?? []).map(option => ({
        value: option.value,
        label: option.label,
      })),
    [subcategoryDefinition?.options]
  );
  const { data: selectedAccountOption } = useQuery({
    queryKey: ['additional-settings-account-option', value],
    queryFn: async () => {
      if (subcategoryDefinition?.optionsSource !== 'account-profile' || !value) {
        return null;
      }

      const account = await accountProfileApi.getAccountProfileById(value);
      return account
        ? {
            value: account.id,
            label: formatAccountProfileLabel(account),
          }
        : null;
    },
    enabled: subcategoryDefinition?.optionsSource === 'account-profile' && Boolean(value),
  });
  const selectedValueOption =
    selectedAccountOption ?? selectValueOptions.find(option => option.value === value) ?? null;
  const loadAccountProfileOptions = useCallback(
    async (inputValue: string, page = 1) => {
      const response = await accountProfileApi.getAccountProfiles({
        page,
        limit: 30,
        search: inputValue,
        active: true,
      });

      return {
        options: (response.data || []).map(account => ({
          value: account.id,
          label: formatAccountProfileLabel(account),
        })),
        hasMore: (response.data || []).length === 30,
      };
    },
    []
  );
  const loadSelectValueOptions = useCallback(
    async (inputValue = '', page = 1) => {
      if (subcategoryDefinition?.optionsSource === 'account-profile') {
        return loadAccountProfileOptions(inputValue, page);
      }

      return {
        options: selectValueOptions,
        hasMore: false,
      };
    },
    [loadAccountProfileOptions, subcategoryDefinition?.optionsSource, selectValueOptions]
  );

  const handleNumberingValueChange = (nextValue: string) => {
    setValueError('');
    setValue(nextValue.replace(/\D/g, '').slice(0, 9));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesc = description.trim();
    if (!cleanDesc) return;

    if (isTransactionNumberingCategory) {
      const cleanValue = value.trim();
      if (!cleanValue) {
        setValueError('Series value is required');
        return;
      }

      if (!/^\d+$/.test(cleanValue)) {
        setValueError('Only digits are allowed');
        return;
      }

      if (cleanValue.length !== 9) {
        setValueError('Series value must be exactly 9 digits');
        return;
      }
    }

    setIsSaving(true);
    try {
      const cleanValue = isBooleanType ? value.toUpperCase() : value.trim();
      await onSave({
        description: cleanDesc,
        value: cleanValue,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-medium text-text-secondary">
          Description
        </label>
        {isPolicyCategory ? (
          <div className="w-full rounded-sm border border-border-primary bg-surface-secondary px-3 py-3 text-xs leading-5 text-text-primary">
            {description}
          </div>
        ) : (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-xs leading-5 text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Enter description"
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-medium text-text-secondary">
            Code (Disabled)
          </label>
          <Input
            type="text"
            value={code}
            disabled
            valueTransform="none"
            classes={{ container: 'max-w-none' }}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-text-secondary">
            Type (Disabled)
          </label>
          <Input
            type="text"
            value={categoryType.toUpperCase()}
            disabled
            valueTransform="none"
            classes={{ container: 'max-w-none' }}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-text-secondary">
          Value
        </label>
        {isBooleanType ? (
          <div className="flex items-center gap-3 rounded-sm border border-border-primary bg-surface-primary px-3 py-3">
            <Checkbox
              checked={value.toUpperCase() === 'YES'}
              onChange={checked => setValue(checked ? 'YES' : 'NO')}
              aria-label={`Toggle ${subcategoryDefinition?.label ?? 'value'}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {subcategoryDefinition?.label ?? 'Enabled'}
              </p>
              <p className="text-xs leading-5 text-text-secondary">
                Check this box to enable the setting.
              </p>
            </div>
          </div>
        ) : isDateType ? (
          <Input
            type="date"
            value={value.split('T')[0]}
            onChange={e => setValue(e.target.value)}
            required
            valueTransform="none"
            classes={{ container: 'max-w-none' }}
          />
        ) : isSelectType ? (
          <AsyncSelect
            value={selectedValueOption}
            onChange={option => {
              const nextOption = Array.isArray(option) ? option[0] : option;
              setValue(nextOption ? String(nextOption.value) : '');
            }}
            loadOptions={loadSelectValueOptions}
            placeholder="Select value"
            isSearchable={subcategoryDefinition?.optionsSource === 'account-profile'}
            isClearable={!isRequiredPolicyValue}
            isDisabled={false}
          />
        ) : isNumberType ? (
          <div className="space-y-1">
            <Input
              type={isTransactionNumberingCategory ? 'text' : 'number'}
              inputMode={isTransactionNumberingCategory ? 'numeric' : undefined}
              pattern={isTransactionNumberingCategory ? '\\d*' : undefined}
              maxLength={isTransactionNumberingCategory ? 9 : undefined}
              value={value}
              onChange={(e) =>
                isTransactionNumberingCategory
                  ? handleNumberingValueChange(e.target.value)
                  : setValue(e.target.value)
              }
              required={isRequiredPolicyValue}
              minLength={isTransactionNumberingCategory ? 9 : undefined}
              min={subcategoryDefinition?.valueType === 'number' ? 0 : undefined}
              step={subcategoryDefinition?.valueType === 'number' ? '1' : 'any'}
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
              placeholder={
                isTransactionNumberingCategory
                  ? 'Enter 9-digit series counter'
                  : subcategoryDefinition?.placeholder ??
                    (isRequiredPolicyValue ? 'Enter value' : 'Enter value or leave blank')
              }
            />
            {isTransactionNumberingCategory ? (
              <p className="text-[11px] leading-5 text-text-secondary">
                Enter exactly 9 digits. The final number is branch code + financial year + series = 15 characters.
              </p>
            ) : null}
            {valueError ? (
              <p className="text-[11px] leading-5 text-error-600">{valueError}</p>
            ) : null}
          </div>
        ) : (
          <Input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            required={isRequiredPolicyValue}
            valueTransform="none"
            classes={{ container: 'max-w-none' }}
            placeholder={subcategoryDefinition?.placeholder ?? 'Enter value'}
          />
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-border-primary pt-4">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving || !description.trim()}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export const AdditionalSettingsCategoryDetails = ({
  category,
  onOpenCreateCategory,
  onOpenEditCategory,
  onSaveSubcategory,
}: AdditionalSettingsCategoryDetailsProps) => {
  const [editingSubcategory, setEditingSubcategory] = useState<IAdditionalSettingSubcategory | null>(null);
  const categoryDefinition = getAdditionalSettingCategoryDefinition(category?.code);
  const isLockedCategory = Boolean(categoryDefinition?.titleLocked);

  const hasSubcategories = useMemo(
    () => Boolean(category?.subcategories.length),
    [category]
  );

  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-text-secondary">
            Details
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Category Details
          </h2>
        </div>

        <Button type="button" onClick={onOpenCreateCategory}>
          Create Category
        </Button>
      </div>

      {!category ? (
        <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary p-6 text-center">
          <p className="text-sm font-semibold text-text-primary">
            No categories created yet
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Create a category to start managing additional settings.
          </p>
          <Button type="button" onClick={onOpenCreateCategory}>
            Create Category
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-sm border border-border-primary bg-surface-secondary p-5">
            <CategoryTitleEditor
              category={category}
              onOpenEditCategory={onOpenEditCategory}
            />
          </section>

          <section className="rounded-sm border border-border-primary bg-surface-secondary p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-text-primary">
                  Subcategories
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Manage subcategory definitions for this category.
                </p>
              </div>
              <p className="text-sm font-medium text-text-secondary">
                {category.subcategories.length} items
              </p>
            </div>

            {hasSubcategories ? (
              <div className="overflow-hidden rounded-sm border border-border-primary bg-surface-primary">
                <table className="w-full border-collapse">
                  <thead className="bg-surface-secondary">
                    <tr className="text-left text-sm text-text-secondary">
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Value</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.subcategories.map(subcategory => (
                      <SubcategoryRow
                        key={subcategory.id}
                        subcategory={subcategory}
                        categoryCode={category.code}
                        onEdit={setEditingSubcategory}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-border-primary bg-surface-primary p-4 text-xs leading-5 text-text-secondary">
                No subcategories for this category yet.
              </div>
            )}
          </section>
        </div>
      )}

      <Modal
        open={editingSubcategory !== null}
        onOpenChange={(open) => {
          if (!open) setEditingSubcategory(null);
        }}
        title="Edit Subcategory"
        description={
          isLockedCategory
            ? 'Update the policy value only. Codes and labels are locked.'
            : 'Update subcategory settings below. Once created, code and type cannot be changed.'
        }
        size="md"
      >
        {editingSubcategory && (
          <EditSubcategoryForm
            categoryCode={category?.code}
            subcategory={editingSubcategory}
            isPolicyCategory={isLockedCategory}
            onCancel={() => setEditingSubcategory(null)}
            onSave={async (values) => {
              if (category) {
                await onSaveSubcategory(category.id, editingSubcategory.id, values);
                setEditingSubcategory(null);
              }
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdditionalSettingsCategoryDetails;
