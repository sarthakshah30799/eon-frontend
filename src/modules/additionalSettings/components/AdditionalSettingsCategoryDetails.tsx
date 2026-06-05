import { useEffect, useMemo, useState } from 'react';
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
    values: { title: string; value: string }
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
          {actionIcon('M11 5h2M12 4v2m4.95 1.05l1.414 1.414M20 12h-2m-1 4.95l-1.414-1.414M12 20v-2m-4.95-1.05l-1.414-1.414M4 12h2m1-4.95l1.414 1.414')}
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

const EditableSubcategoryRow = ({
  subcategory,
  categoryId,
  onSaveSubcategory,
}: {
  subcategory: IAdditionalSettingSubcategory;
  categoryId: string;
  onSaveSubcategory: (
    categoryId: string,
    subcategoryId: string,
    values: { title: string; value: string }
  ) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(subcategory.title);
  const [draftValue, setDraftValue] = useState(subcategory.value);

  useEffect(() => {
    setDraftTitle(subcategory.title);
    setDraftValue(subcategory.value);
    setIsEditing(false);
  }, [subcategory.id, subcategory.title, subcategory.value]);

  const handleSave = async () => {
    const nextTitle = draftTitle.trim();
    const nextValue = draftValue.trim();

    if (!nextTitle || !nextValue) {
      setDraftTitle(subcategory.title);
      setDraftValue(subcategory.value);
      setIsEditing(false);
      return;
    }

    try {
      await onSaveSubcategory(categoryId, subcategory.id, {
        title: nextTitle,
        value: nextValue,
      });
      setIsEditing(false);
    } catch {
      setDraftTitle(subcategory.title);
      setDraftValue(subcategory.value);
    }
  };

  if (!isEditing) {
    return (
      <tr className="border-t border-border-primary">
        <td className="px-4 py-3 text-sm text-text-primary">
          {subcategory.title}
        </td>
        <td className="px-4 py-3 text-sm text-text-secondary">
          {subcategory.value}
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            className={iconButtonClass}
            aria-label={`Edit ${subcategory.title}`}
            onClick={() => setIsEditing(true)}
          >
            {actionIcon('M11 5h2M12 4v2m4.95 1.05l1.414 1.414M20 12h-2m-1 4.95l-1.414-1.414M12 20v-2m-4.95-1.05l-1.414-1.414M4 12h2m1-4.95l1.414 1.414')}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border-primary bg-primary-50/30">
      <td className="px-4 py-3">
        <input
          value={draftTitle}
          onChange={event => setDraftTitle(event.target.value)}
          className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          value={draftValue}
          onChange={event => setDraftValue(event.target.value)}
          className="w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={iconButtonClass}
            aria-label={`Save ${subcategory.title}`}
            onClick={handleSave}
          >
            {actionIcon('M5 13l4 4L19 7')}
          </button>
          <button
            type="button"
            className={iconButtonClass}
            aria-label={`Cancel ${subcategory.title}`}
            onClick={() => {
              setDraftTitle(subcategory.title);
              setDraftValue(subcategory.value);
              setIsEditing(false);
            }}
          >
            {actionIcon('M6 18L18 6M6 6l12 12')}
          </button>
        </div>
      </td>
    </tr>
  );
};

export const AdditionalSettingsCategoryDetails = ({
  category,
  onOpenCreateCategory,
  onSaveCategoryTitle,
  onSaveSubcategory,
}: AdditionalSettingsCategoryDetailsProps) => {
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
                  Title and value can be edited inline.
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
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.subcategories.map(subcategory => (
                      <EditableSubcategoryRow
                        key={subcategory.id}
                        categoryId={category.id}
                        subcategory={subcategory}
                        onSaveSubcategory={onSaveSubcategory}
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
    </div>
  );
};

export default AdditionalSettingsCategoryDetails;
