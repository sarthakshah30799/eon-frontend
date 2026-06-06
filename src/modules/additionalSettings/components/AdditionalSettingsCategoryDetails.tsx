import { useEffect, useMemo, useState } from 'react';
import type {
  IAdditionalSettingCategory,
  IAdditionalSettingSubcategory,
} from '../types';
import { Button, Input, Table, type TableColumnDef } from '@/components/ui';
import {
  CheckIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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

        <Button
          type="button"
          aria-label="Edit category title"
          onClick={() => setIsEditing(true)}
          className="border-0! bg-transparent! text-black!"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Input
        value={draftTitle}
        onChange={event => setDraftTitle(event.target.value)}
        className="w-full"
      />
      <Button
        type="button"
        className="border-0! bg-transparent! text-black!"
        aria-label="Save category title"
        onClick={handleSave}
      >
        <CheckIcon className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        className="border-0! bg-transparent! text-black!"
        aria-label="Cancel category title edit"
        onClick={() => {
          setDraftTitle(category.title);
          setIsEditing(false);
        }}
      >
        <XMarkIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};

export const AdditionalSettingsCategoryDetails = ({
  category,
  onOpenCreateCategory,
  onSaveCategoryTitle,
  onSaveSubcategory,
}: AdditionalSettingsCategoryDetailsProps) => {
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<
    string | null
  >(null);
  const [subcategoryDrafts, setSubcategoryDrafts] = useState<
    Record<string, { title: string; value: string }>
  >({});

  useEffect(() => {
    if (!category) {
      setEditingSubcategoryId(null);
      setSubcategoryDrafts({});
      return;
    }

    setEditingSubcategoryId(null);
    setSubcategoryDrafts(prevDrafts => {
      const nextDrafts: Record<string, { title: string; value: string }> = {};

      category.subcategories.forEach(subcategory => {
        nextDrafts[subcategory.id] = prevDrafts[subcategory.id] ?? {
          title: subcategory.title,
          value: subcategory.value,
        };
      });

      return nextDrafts;
    });
  }, [category]);

  const subcategoryColumns = useMemo<
    TableColumnDef<IAdditionalSettingSubcategory>[]
  >(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => {
          const subcategory = row.original;
          const isEditing = editingSubcategoryId === subcategory.id;
          const draft = subcategoryDrafts[subcategory.id] ?? {
            title: subcategory.title,
            value: subcategory.value,
          };

          if (!isEditing) {
            return (
              <span className="text-sm text-text-primary">
                {subcategory.title}
              </span>
            );
          }

          return (
            <Input
              value={draft.title}
              onChange={event =>
                setSubcategoryDrafts(prev => ({
                  ...prev,
                  [subcategory.id]: {
                    ...draft,
                    title: event.target.value,
                  },
                }))
              }
              className="w-full"
            />
          );
        },
      },
      {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => {
          const subcategory = row.original;
          const isEditing = editingSubcategoryId === subcategory.id;
          const draft = subcategoryDrafts[subcategory.id] ?? {
            title: subcategory.title,
            value: subcategory.value,
          };

          if (!isEditing) {
            return (
              <span className="text-sm text-text-secondary">
                {subcategory.value}
              </span>
            );
          }

          return (
            <Input
              value={draft.value}
              onChange={event =>
                setSubcategoryDrafts(prev => ({
                  ...prev,
                  [subcategory.id]: {
                    ...draft,
                    value: event.target.value,
                  },
                }))
              }
              className="w-full"
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const subcategory = row.original;
          const isEditing = editingSubcategoryId === subcategory.id;
          const draft = subcategoryDrafts[subcategory.id] ?? {
            title: subcategory.title,
            value: subcategory.value,
          };

          const handleSave = async () => {
            const nextTitle = draft.title.trim();
            const nextValue = draft.value.trim();

            if (!nextTitle || !nextValue) {
              setSubcategoryDrafts(prev => ({
                ...prev,
                [subcategory.id]: {
                  title: subcategory.title,
                  value: subcategory.value,
                },
              }));
              setEditingSubcategoryId(null);
              return;
            }

            try {
              await onSaveSubcategory(category.id, subcategory.id, {
                title: nextTitle,
                value: nextValue,
              });
              setEditingSubcategoryId(null);
            } catch {
              setSubcategoryDrafts(prev => ({
                ...prev,
                [subcategory.id]: {
                  title: subcategory.title,
                  value: subcategory.value,
                },
              }));
            }
          };

          if (!isEditing) {
            return (
              <Button
                type="button"
                aria-label={`Edit ${subcategory.title}`}
                onClick={() => setEditingSubcategoryId(subcategory.id)}
                className="border-0! bg-transparent! text-black!"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </Button>
            );
          }

          return (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                aria-label={`Save ${subcategory.title}`}
                onClick={handleSave}
                className="border-0! bg-transparent! text-black!"
              >
                <CheckIcon className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                className="border-0! bg-transparent! text-black!"
                aria-label={`Cancel ${subcategory.title}`}
                onClick={() => {
                  setSubcategoryDrafts(prev => ({
                    ...prev,
                    [subcategory.id]: {
                      title: subcategory.title,
                      value: subcategory.value,
                    },
                  }));
                  setEditingSubcategoryId(null);
                }}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [category, editingSubcategoryId, onSaveSubcategory, subcategoryDrafts]
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

            {category.subcategories.length > 0 ? (
              <Table
                columns={subcategoryColumns}
                data={category.subcategories}
                enableSorting={false}
                enableFiltering={false}
                enablePagination={false}
                className="w-full"
              />
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
