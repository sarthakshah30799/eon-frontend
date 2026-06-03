import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import {
  buildCategoryOptionPayloads,
  mapCategoryOptionsToFormValues,
} from '../utils';
import {
  useGetCategoryOptionsByCode,
  useSaveCategoryOptions,
} from '../hooks';
import { CategoryOptionsForm } from '../forms';
import type { ICategoryOptionsFormValues } from '../utils';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';

export const CategoryOptionsEditView = () => {
  const navigate = useNavigate();
  const { code = '' } = useParams<{ code: string }>();
  const normalizedCode = code as CategoryOptionCode;
  const { data: categoryOptions = [], isLoading } =
    useGetCategoryOptionsByCode(normalizedCode);
  const { submitCategoryOptions, isPending } = useSaveCategoryOptions();

  const defaultValues: ICategoryOptionsFormValues | null = useMemo(() => {
    if (!categoryOptions.length) {
      return null;
    }

    return mapCategoryOptionsToFormValues(categoryOptions);
  }, [categoryOptions]);

  const handleSubmit = async (values: ICategoryOptionsFormValues) => {
    const updates = values.items
      .filter(item => Boolean(item.id))
      .map(item => ({
        id: item.id as string,
        data: buildCategoryOptionPayloads({
          ...values,
          items: [item],
        })[0]!,
      }));

    const creates = buildCategoryOptionPayloads({
      ...values,
      items: values.items.filter(item => !item.id),
    });

    await submitCategoryOptions({
      updates,
      creates,
    });

    navigate('/admin/category-options');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!defaultValues) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Category options not found</p>
      </div>
    );
  }

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/admin/category-options')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {CATEGORY_OPTIONS_TEXTS.EDIT_TITLE}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {CATEGORY_OPTIONS_TEXTS.EDIT_SUBTITLE}
        </p>
      </div>

      <CategoryOptionsForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel={CATEGORY_OPTIONS_TEXTS.SAVE_CHANGES}
        isSubmitting={isPending}
        mode="edit"
        fixedCode={defaultValues.code}
      />
    </section>
  );
};

export default CategoryOptionsEditView;
