import { useState } from 'react';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import { createEmptyCategoryOptionFormValues } from '../utils';
import { useCreateCategoryOption } from '../hooks';
import type { ICreateCategoryOption } from '@/types/categoryOptionTypes';
import { CategoryOptionsForm } from '../forms';

export const CategoryOptionsCreateView = () => {
  const { submitCategoryOption, isPending } = useCreateCategoryOption();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: ICreateCategoryOption) => {
    await submitCategoryOption(values);
    setFormKey(prev => prev + 1);
  };

  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-text-primary">
          {CATEGORY_OPTIONS_TEXTS.CREATE_TITLE}
        </h1>
        <p className="text-sm text-text-secondary">
          {CATEGORY_OPTIONS_TEXTS.FORM_SUBTITLE}
        </p>
      </div>

      <CategoryOptionsForm
        key={formKey}
        defaultValues={createEmptyCategoryOptionFormValues()}
        onSubmit={handleSubmit}
        submitLabel={CATEGORY_OPTIONS_TEXTS.SAVE_CHANGES}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default CategoryOptionsCreateView;
