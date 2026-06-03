import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { useListCategoryOptions } from '../hooks';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import { CategoryOptionsTable } from '../components';

export const CategoryOptionsListView = () => {
  const navigate = useNavigate();
  const { data: options = [], isLoading, error } = useListCategoryOptions();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load category options.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {CATEGORY_OPTIONS_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {CATEGORY_OPTIONS_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate('/admin/category-options/create')}
          >
            {CATEGORY_OPTIONS_TEXTS.CREATE_TITLE}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CategoryOptionsTable options={options} />
      </section>
    </div>
  );
};

export default CategoryOptionsListView;
