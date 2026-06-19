import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui';
import type {
  IAdditionalSettingCategory,
  IAdditionalSettingSubcategory,
} from '../types';
import { Button } from '@/components/ui';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  getAdditionalSettingCategoryDefinition,
  getAdditionalSettingSubcategoryDefinition,
} from '../registry/additionalSettingsRegistry';

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
        <h3 className="truncate text-xl font-semibold text-text-primary">
          {category.title}
        </h3>
        <p className="mt-1 text-xs uppercase text-text-tertiary">
          {category.code}
        </p>
      </div>

      {!isReadOnly ? (
        <Button
          type="button"
          aria-label="Edit category"
          onClick={() => onOpenEditCategory(category)}
          className="border-0! bg-transparent! text-black!"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </Button>
      ) : null}
    </div>
  );
};

const SubcategoryRow = ({
  subcategory,
  onEdit,
}: {
  subcategory: IAdditionalSettingSubcategory;
  onEdit: (sub: IAdditionalSettingSubcategory) => void;
}) => {
  return (
    <tr className="border-t border-border-primary hover:bg-surface-secondary/30">
      <td className="px-4 py-3 text-sm text-text-primary">
        {subcategory.description || subcategory.title}
      </td>
      <td className="px-4 py-3 text-sm text-text-primary font-medium">
        {subcategory.value}
      </td>
      <td className="px-4 py-3">
        <Button
          type="button"
          aria-label={`Edit ${subcategory.title}`}
          onClick={() => onEdit(subcategory)}
          className="border-0! bg-transparent! text-black!"
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
  const [isSaving, setIsSaving] = useState(false);
  const subcategoryDefinition = getAdditionalSettingSubcategoryDefinition(
    categoryCode,
    subcategory.code
  );
  const isRequiredPolicyValue = subcategoryDefinition?.required ?? true;

  const isBooleanType = categoryType.toLowerCase() === 'boolean';
  const isNumberType = categoryType.toLowerCase() === 'number' || categoryType.toLowerCase() === 'decimal';
  const isDateType = categoryType.toLowerCase() === 'date';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesc = description.trim();
    if (!cleanDesc) return;

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          Description
        </label>
        {isPolicyCategory ? (
          <div className="w-full rounded-sm border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-primary">
            {description}
          </div>
        ) : (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Enter description"
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Code (Disabled)
          </label>
          <input
            type="text"
            value={code}
            disabled
            className="w-full rounded-sm border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-tertiary cursor-not-allowed outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Type (Disabled)
          </label>
          <input
            type="text"
            value={categoryType.toUpperCase()}
            disabled
            className="w-full rounded-sm border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-tertiary cursor-not-allowed outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          Value
        </label>
        {isBooleanType ? (
          <select
            value={value.toUpperCase() === 'YES' ? 'YES' : 'NO'}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        ) : isDateType ? (
          <input
            type="date"
            value={value.split('T')[0]}
            onChange={(e) => setValue(e.target.value)}
            required
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        ) : isNumberType ? (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required={isRequiredPolicyValue}
            min={subcategoryDefinition?.valueType === 'number' ? 0 : undefined}
            step={subcategoryDefinition?.valueType === 'number' ? '1' : 'any'}
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder={
              subcategoryDefinition?.placeholder ??
              (isRequiredPolicyValue ? 'Enter value' : 'Enter value or leave blank')
            }
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required={isRequiredPolicyValue}
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder={subcategoryDefinition?.placeholder ?? 'Enter value'}
          />
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-border-primary pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-sm border border-border-primary bg-surface-primary px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || !description.trim()}
          className="rounded-sm border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
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
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-text-tertiary">
            Details
          </p>
          <h2 className="mt-2 text-lg font-semibold text-text-primary">
            Category Details
          </h2>
        </div>

        <Button type="button" onClick={onOpenCreateCategory}>
          Create Category
        </Button>
      </div>

      {!category ? (
        <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary p-6 text-center">
          <p className="text-sm font-medium text-text-primary">
            No categories created yet
          </p>
          <p className="mt-2 text-sm text-text-tertiary">
            Create a category to start managing additional settings.
          </p>
          <Button type="button" onClick={onOpenCreateCategory}>
            Create Category
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-sm border border-border-primary bg-surface-secondary p-4">
            <CategoryTitleEditor
              category={category}
              isReadOnly={Boolean(categoryDefinition?.titleLocked)}
              onOpenEditCategory={onOpenEditCategory}
            />
          </section>

          <section className="rounded-sm border border-border-primary bg-surface-secondary p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Subcategories
                </p>
                <p className="text-xs text-text-tertiary">
                  Manage subcategory definitions for this category.
                </p>
              </div>
              <p className="text-xs text-text-tertiary">
                {category.subcategories.length} items
              </p>
            </div>

            {hasSubcategories ? (
              <div className="overflow-hidden rounded-sm border border-border-primary bg-surface-primary">
                <table className="w-full border-collapse">
                  <thead className="bg-surface-secondary">
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-text-tertiary">
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.subcategories.map(subcategory => (
                      <SubcategoryRow
                        key={subcategory.id}
                        subcategory={subcategory}
                        onEdit={setEditingSubcategory}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-border-primary bg-surface-primary p-4 text-sm text-text-tertiary">
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
