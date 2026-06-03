import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import {
  buildCategoryOptionPayloads,
  createEmptyCategoryOptionsFormValues,
} from '../utils';
import { useBulkCreateCategoryOptions } from '../hooks';
import { CategoryOptionsForm } from '../forms';
import type { ICategoryOptionsFormValues } from '../utils';

export const CategoryOptionsCreateView = () => {
  const navigate = useNavigate();
  const { submitCategoryOptions, isPending } = useBulkCreateCategoryOptions();

  const handleSubmit = async (values: ICategoryOptionsFormValues) => {
    await submitCategoryOptions(buildCategoryOptionPayloads(values));
    navigate('/admin/category-options');
  };

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
          {CATEGORY_OPTIONS_TEXTS.CREATE_TITLE}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {CATEGORY_OPTIONS_TEXTS.CREATE_SUBTITLE}
        </p>
      </div>

      <CategoryOptionsForm
        defaultValues={createEmptyCategoryOptionsFormValues()}
        onSubmit={handleSubmit}
        submitLabel={CATEGORY_OPTIONS_TEXTS.SAVE_OPTIONS}
        isSubmitting={isPending}
        mode="create"
      />
    </section>
  );
};

export default CategoryOptionsCreateView;
