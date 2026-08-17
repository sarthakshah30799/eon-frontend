import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { AdditionalSettingsCreateForm } from '../forms';
import {
  useCreateAdditionalSetting,
  useListAdditionalSettings,
  useUpdateAdditionalSettingCategory,
  useUpdateAdditionalSettingSubcategory,
} from '../hooks';
import {
  createEmptyAdditionalSettingCategoryFormValues,
  mapCategoryToFormValues,
} from '../utils';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';
import { getAdditionalSettingCategoryDefinition } from '../registry/additionalSettingsRegistry';
import { AdditionalSettingsCategoryDetails } from '../components';
import { AdditionalSettingsCategoryList } from '../components';
import { useListAccountProfiles } from '@/modules/accountProfile/hooks';
import type {
  IAdditionalSettingCategory,
  IAdditionalSettingCategoryFormValues,
} from '../types';

interface AdditionalSettingsViewProps {
  preferredCategoryCode?: string;
}

export const AdditionalSettingsView = ({
  preferredCategoryCode,
}: AdditionalSettingsViewProps = {}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [categoryModalMode, setCategoryModalMode] = useState<
    'create' | 'edit' | null
  >(null);
  const [editingCategory, setEditingCategory] =
    useState<IAdditionalSettingCategory | null>(null);

  const {
    data: categories = [],
    isLoading,
    error,
  } = useListAdditionalSettings();
  const {
    submitAdditionalSetting: createAdditionalSetting,
    isPending: isCreating,
  } = useCreateAdditionalSetting();
  const {
    submitAdditionalSettingCategory: updateAdditionalSettingCategory,
    isPending: isUpdatingCategory,
  } = useUpdateAdditionalSettingCategory();
  const { submitAdditionalSetting: updateSubcategory } =
    useUpdateAdditionalSettingSubcategory();

  const preferredCategory = preferredCategoryCode
    ? categories.find(
        category =>
          category.code.trim().toUpperCase() ===
          preferredCategoryCode.trim().toUpperCase()
      )
    : null;

  const activeCategoryId =
    selectedCategoryId ?? preferredCategory?.id ?? categories[0]?.id ?? null;

  const activeCategory = useMemo<IAdditionalSettingCategory | null>(() => {
    if (!activeCategoryId) {
      return null;
    }

    return (
      categories.find(category => category.id === activeCategoryId) ?? null
    );
  }, [activeCategoryId, categories]);
  const activeCategoryUsesAccountProfiles = Boolean(
    getAdditionalSettingCategoryDefinition(activeCategory?.code)?.subcategories.some(
      subcategory => subcategory.optionsSource === 'account-profile'
    )
  );
  const shouldLoadAccountProfiles =
    activeCategoryUsesAccountProfiles || categoryModalMode !== null;
  const { data: accountProfileResponse, isFetching: areAccountProfilesFetching } =
    useListAccountProfiles(
      { page: 1, limit: 100 },
      shouldLoadAccountProfiles
    );
  const accountProfiles = accountProfileResponse?.data ?? [];

  const handleCreateSubmit = async (
    values: IAdditionalSettingCategoryFormValues
  ) => {
    const createdCategory = await createAdditionalSetting(values);
    setSelectedCategoryId(createdCategory.id);
    setCategoryModalMode(null);
    setEditingCategory(null);
  };

  const handleUpdateSubmit = async (
    values: IAdditionalSettingCategoryFormValues
  ) => {
    if (!editingCategory) {
      return;
    }

    const updatedCategory = await updateAdditionalSettingCategory({
      categoryId: editingCategory.id,
      values,
    });
    setSelectedCategoryId(updatedCategory.id);
    setCategoryModalMode(null);
    setEditingCategory(null);
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
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdditionalSettingsCategoryList
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        <AdditionalSettingsCategoryDetails
          category={activeCategory}
          accountProfiles={accountProfiles}
          areAccountProfilesFetching={areAccountProfilesFetching}
          onOpenCreateCategory={() => {
            setEditingCategory(null);
            setCategoryModalMode('create');
          }}
          onOpenEditCategory={category => {
            setEditingCategory(category);
            setCategoryModalMode('edit');
          }}
          onSaveSubcategory={async (categoryId, subcategoryId, values) => {
            await updateSubcategory({
              categoryId,
              subcategoryId,
              description: values.description,
              value: values.value,
            });
          }}
        />
      </div>

      <Modal
        open={categoryModalMode !== null}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setCategoryModalMode(null);
            setEditingCategory(null);
          }
        }}
        title={
          categoryModalMode === 'edit'
            ? ADDITIONAL_SETTINGS_TEXTS.UPDATE_CATEGORY_TITLE
            : ADDITIONAL_SETTINGS_TEXTS.CREATE_CATEGORY_TITLE
        }
        description={
          categoryModalMode === 'edit'
            ? ADDITIONAL_SETTINGS_TEXTS.UPDATE_CATEGORY_SUBTITLE
            : ADDITIONAL_SETTINGS_TEXTS.CREATE_CATEGORY_SUBTITLE
        }
        size="xl"
      >
        <AdditionalSettingsCreateForm
          accountProfiles={accountProfiles}
          defaultValues={
            categoryModalMode === 'edit' && editingCategory
              ? mapCategoryToFormValues(editingCategory)
              : createEmptyAdditionalSettingCategoryFormValues()
          }
          existingCategoryCodes={categories.map(category => category.code)}
          onSubmit={
            categoryModalMode === 'edit'
              ? handleUpdateSubmit
              : handleCreateSubmit
          }
          isSubmitting={isCreating || isUpdatingCategory}
          submitLabel={
            categoryModalMode === 'edit'
              ? ADDITIONAL_SETTINGS_TEXTS.UPDATE_CATEGORY
              : ADDITIONAL_SETTINGS_TEXTS.CREATE_CATEGORY
          }
          currentId={categoryModalMode === 'edit' ? editingCategory?.id : undefined}
        />
      </Modal>
    </section>
  );
};

export default AdditionalSettingsView;
