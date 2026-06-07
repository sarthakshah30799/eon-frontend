import { useCallback, useRef, useState } from 'react';
import { Modal, type AsyncSelectOption } from '@/components/ui';
import { FormFieldSelect } from '../FormFieldSelect';
import {
  CategoryOptionsForm,
  buildCategoryOptionPayloads,
  createEmptyCategoryOptionsFormValues,
} from '@/modules/categoryOptions';
import { useCategoryOptions } from '@/hooks';
import type { ComponentProps } from 'react';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';
import type { ICategoryOptionsFormValues } from '@/modules/categoryOptions';

type FormFieldSelectProps = ComponentProps<typeof FormFieldSelect>;

interface FormFieldCategoryOptionProps
  extends Omit<
    FormFieldSelectProps,
    'loadOptions' | 'defaultOptions' | 'isCreatable' | 'isSearchable' | 'onCreateOption'
  > {
  code: CategoryOptionCode;
  createLabel?: string;
  isCreatable?: boolean;
  isSearchable?: boolean;
  useValueAsId?: boolean;
  onCreateTransform?: (
    inputValue: string
  ) => { value: string; label: string } | Promise<{ value: string; label: string }>;
}

export const FormFieldCategoryOption = ({
  code,
  createLabel = 'Create',
  isCreatable = true,
  isSearchable = true,
  useValueAsId = false,
  onCreateTransform,
  ...props
}: FormFieldCategoryOptionProps) => {
  const { defaultOptions, loadOptions, createOptions, isLoading } =
    useCategoryOptions(code, useValueAsId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDefaultValues, setPendingDefaultValues] =
    useState<ICategoryOptionsFormValues>(
      createEmptyCategoryOptionsFormValues(code)
    );
  const pendingResolverRef = useRef<{
    resolve: (option?: AsyncSelectOption | void) => void;
  } | null>(null);

  const closeCreateModal = useCallback(
    (nextOpen: boolean) => {
      setIsCreateModalOpen(nextOpen);

      if (nextOpen) {
        return;
      }

      setPendingDefaultValues(createEmptyCategoryOptionsFormValues(code));
      setCreateError(null);
      setIsCreating(false);
      pendingResolverRef.current?.resolve(undefined);
      pendingResolverRef.current = null;
    },
    [code]
  );

  const handleCreateOption = useCallback(
    async (inputValue: string): Promise<AsyncSelectOption | void> => {
      if (!isCreatable) {
        return;
      }

      const resolvedInput = onCreateTransform
        ? await onCreateTransform(inputValue)
        : { value: inputValue, label: inputValue };

      setPendingDefaultValues({
        ...createEmptyCategoryOptionsFormValues(code),
        items: [{ value: resolvedInput.value, label: resolvedInput.label }],
      });
      setCreateError(null);
      setIsCreateModalOpen(true);

      return new Promise<AsyncSelectOption | void>(resolve => {
        pendingResolverRef.current = { resolve };
      });
    },
    [code, isCreatable, onCreateTransform]
  );

  const handleBulkSubmit = useCallback(
    async (values: ICategoryOptionsFormValues) => {
      setIsCreating(true);

      try {
        const createdOptions = await createOptions(buildCategoryOptionPayloads(values));
        const firstCreatedOption = createdOptions[0] ?? null;

        if (!firstCreatedOption) {
          throw new Error('Failed to create category option');
        }

        pendingResolverRef.current?.resolve(firstCreatedOption);
        pendingResolverRef.current = null;
        setCreateError(null);
        setIsCreateModalOpen(false);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to create category option';

        setCreateError(message);
      } finally {
        setIsCreating(false);
      }
    },
    [createOptions]
  );

  return (
    <>
      <FormFieldSelect
        {...props}
        loadOptions={loadOptions}
        defaultOptions={defaultOptions}
        isLoading={isLoading}
        isCreatable={isCreatable}
        isSearchable={isSearchable}
        onCreateOption={handleCreateOption}
        formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
      />

      <Modal
        open={isCreateModalOpen}
        onOpenChange={closeCreateModal}
        title={`Create ${code}`}
        description="Create one or more options for this dropdown. Add extra rows if you need more than one value."
        size="lg"
      >
        {createError && (
          <div className="mb-4 rounded-sm border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-700">
            {createError}
          </div>
        )}

        <CategoryOptionsForm
          defaultValues={pendingDefaultValues}
          fixedCode={code}
          onSubmit={handleBulkSubmit}
          submitLabel="Create Options"
          isSubmitting={isCreating}
          mode="create"
        />
      </Modal>
    </>
  );
};
