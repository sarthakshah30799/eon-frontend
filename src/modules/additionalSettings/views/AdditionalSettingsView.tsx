import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { AdditionalSettingsCreateForm } from '../forms';
import {
  useCreateAdditionalSetting,
  useListAdditionalSettings,
  useUpdateAdditionalSetting,
  useUpdateAdditionalSettingSubcategory,
} from '../hooks';
import {
  createEmptyAdditionalSettingCategoryFormValues,
} from '../utils';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';
import { AdditionalSettingsCategoryDetails } from '../components';
import { AdditionalSettingsCategoryList } from '../components';
import type {
  IAdditionalSettingCategory,
  IAdditionalSettingCategoryFormValues,
} from '../types';

export const AdditionalSettingsView = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: categories = [],
    isLoading,
    error,
  } = useListAdditionalSettings();
  const { submitAdditionalSetting: createAdditionalSetting, isPending: isCreating } =
    useCreateAdditionalSetting();
  const { submitAdditionalSetting: updateCategoryTitle } =
    useUpdateAdditionalSetting();
  const { submitAdditionalSetting: updateSubcategory } =
    useUpdateAdditionalSettingSubcategory();

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null;

  const activeCategory = useMemo<IAdditionalSettingCategory | null>(() => {
    if (!activeCategoryId) {
      return null;
    }

    return categories.find(category => category.id === activeCategoryId) ?? null;
  }, [activeCategoryId, categories]);

  const handleCreateSubmit = async (
    values: IAdditionalSettingCategoryFormValues
  ) => {
    const createdCategory = await createAdditionalSetting(values);
    setSelectedCategoryId(createdCategory.id);
    setIsCreateModalOpen(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 text-center text-error-600 shadow-sm">
        Failed to load additional settings.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          {ADDITIONAL_SETTINGS_TEXTS.ADMIN_LABEL}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {ADDITIONAL_SETTINGS_TEXTS.PAGE_TITLE}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          {ADDITIONAL_SETTINGS_TEXTS.PAGE_SUBTITLE}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdditionalSettingsCategoryList
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        <AdditionalSettingsCategoryDetails
          category={activeCategory}
          onOpenCreateCategory={() => setIsCreateModalOpen(true)}
          onSaveCategoryTitle={async (categoryId, title) => {
            await updateCategoryTitle({ categoryId, title });
          }}
          onSaveSubcategory={async (categoryId, subcategoryId, values) => {
            await updateSubcategory({
              categoryId,
              subcategoryId,
              title: values.title,
              value: values.value,
            });
          }}
        />
      </div>

      <Modal
        open={isCreateModalOpen}
        onOpenChange={nextOpen => {
          setIsCreateModalOpen(nextOpen);
        }}
        title={ADDITIONAL_SETTINGS_TEXTS.CREATE_CATEGORY_TITLE}
        description={ADDITIONAL_SETTINGS_TEXTS.CREATE_CATEGORY_SUBTITLE}
        size="xl"
      >
        <AdditionalSettingsCreateForm
          defaultValues={createEmptyAdditionalSettingCategoryFormValues()}
          onSubmit={handleCreateSubmit}
          isSubmitting={isCreating}
          submitLabel={ADDITIONAL_SETTINGS_TEXTS.ADD_CATEGORY}
        />
      </Modal>
    </section>
  );
};

export default AdditionalSettingsView;
