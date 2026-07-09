import { Button } from '@/components/ui';
import type { IAdditionalSettingCategory } from '../types';

interface AdditionalSettingsCategoryListProps {
  categories: IAdditionalSettingCategory[];
  activeCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export const AdditionalSettingsCategoryList = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}: AdditionalSettingsCategoryListProps) => {
  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-medium text-text-secondary">
          Categories
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
          Available Categories
        </h2>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary p-4 text-sm text-text-tertiary">
          No categories created yet.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(category => {
            const isActive = category.id === activeCategoryId;

            return (
              <Button
                key={category.id}
                type="button"
                variant="outline"
                className={[
                  'w-full justify-start rounded-sm border px-4 py-3 text-left transition',
                  isActive
                    ? '!border-primary-500 !bg-primary-50 !text-primary-700'
                    : '!border-border-primary !bg-surface-secondary !text-text-primary hover:!border-primary-300 hover:!bg-primary-50/70 hover:!text-primary-700',
                ].join(' ')}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-5">
                      {category.title}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {category.code}
                    </p>
                  </div>

                  <span className="text-xs font-medium text-text-secondary">
                    {category.subcategories.length} items
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdditionalSettingsCategoryList;
