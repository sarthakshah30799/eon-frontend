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
    <div className="space-y-4">
      <BackButton
        onClick={() => navigate('/admin/category-options')}
        label="Back"
      />
      <section className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
        <CategoryOptionsForm
          defaultValues={createEmptyCategoryOptionsFormValues()}
          onSubmit={handleSubmit}
          submitLabel={CATEGORY_OPTIONS_TEXTS.SAVE_OPTIONS}
          isSubmitting={isPending}
          mode="create"
        />
      </section>
    </div>
  );
};

export default CategoryOptionsCreateView;
