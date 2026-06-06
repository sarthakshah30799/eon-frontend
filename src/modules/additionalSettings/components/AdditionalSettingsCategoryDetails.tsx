import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui';
import type {
  IAdditionalSettingCategory,
  IAdditionalSettingSubcategory,
} from '../types';

interface AdditionalSettingsCategoryDetailsProps {
  category: IAdditionalSettingCategory | null;
  onOpenCreateCategory: () => void;
  onSaveCategoryTitle: (categoryId: string, title: string) => Promise<void>;
  onSaveSubcategory: (
    categoryId: string,
    subcategoryId: string,
    values: { description: string; value: string }
  ) => Promise<void>;
}

const iconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-primary bg-surface-primary text-text-tertiary transition hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700';

const actionIcon = (path: string) => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d={path}
    />
  </svg>
);

const CategoryTitleEditor = ({
  category,
  onSaveCategoryTitle,
}: {
  category: IAdditionalSettingCategory;
  onSaveCategoryTitle: (categoryId: string, title: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(category.title);

  useEffect(() => {
    setDraftTitle(category.title);
    setIsEditing(false);
  }, [category.id, category.title]);

  const handleSave = async () => {
    const nextTitle = draftTitle.trim();

    if (!nextTitle) {
      setDraftTitle(category.title);
      setIsEditing(false);
      return;
    }

    try {
      await onSaveCategoryTitle(category.id, nextTitle);
      setIsEditing(false);
    } catch {
      setDraftTitle(category.title);
    }
  };

  if (!isEditing) {
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

        <button
          type="button"
          className={iconButtonClass}
          aria-label="Edit category title"
          onClick={() => setIsEditing(true)}
        >
          {actionIcon('M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <input
        value={draftTitle}
        onChange={event => setDraftTitle(event.target.value)}
        className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none ring-0 transition focus:border-primary-500"
      />
      <button
        type="button"
        className={iconButtonClass}
        aria-label="Save category title"
        onClick={handleSave}
      >
        {actionIcon('M5 13l4 4L19 7')}
      </button>
      <button
        type="button"
        className={iconButtonClass}
        aria-label="Cancel category title edit"
        onClick={() => {
          setDraftTitle(category.title);
          setIsEditing(false);
        }}
      >
        {actionIcon('M6 18L18 6M6 6l12 12')}
      </button>
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
        <button
          type="button"
          className={iconButtonClass}
          aria-label={`Edit ${subcategory.title}`}
          onClick={() => onEdit(subcategory)}
        >
          {actionIcon('M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z')}
        </button>
      </td>
    </tr>
  );
};

interface EditSubcategoryFormProps {
  subcategory: IAdditionalSettingSubcategory;
  onSave: (values: { description: string; value: string }) => Promise<void>;
  onCancel: () => void;
}

const EditSubcategoryForm = ({
  subcategory,
  onSave,
  onCancel,
}: EditSubcategoryFormProps) => {
  const [description, setDescription] = useState(subcategory.description || subcategory.title);
  const [code] = useState(subcategory.code);
  const [categoryType] = useState(subcategory.categoryType || 'text');
  const [value, setValue] = useState(subcategory.value);
  const [isSaving, setIsSaving] = useState(false);

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
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="Enter description"
        />
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
            required
            step="any"
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Enter value"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Enter value"
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
  onSaveCategoryTitle,
  onSaveSubcategory,
}: AdditionalSettingsCategoryDetailsProps) => {
  const [editingSubcategory, setEditingSubcategory] = useState<IAdditionalSettingSubcategory | null>(null);

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

        <button
          type="button"
          onClick={onOpenCreateCategory}
          className="rounded-sm border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          Create Category
        </button>
      </div>

      {!category ? (
        <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary p-6 text-center">
          <p className="text-sm font-medium text-text-primary">
            No categories created yet
          </p>
          <p className="mt-2 text-sm text-text-tertiary">
            Create a category to start managing additional settings.
          </p>
          <button
            type="button"
            onClick={onOpenCreateCategory}
            className="mt-4 rounded-sm border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-sm border border-border-primary bg-surface-secondary p-4">
            <CategoryTitleEditor
              category={category}
              onSaveCategoryTitle={onSaveCategoryTitle}
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
        description="Update subcategory settings below. Once created, code and type cannot be changed."
        size="md"
      >
        {editingSubcategory && (
          <EditSubcategoryForm
            subcategory={editingSubcategory}
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
