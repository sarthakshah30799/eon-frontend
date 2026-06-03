import type { SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCheckbox, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import { menuSchema } from '../schema/menuSchema';
import type { ICreateMenu } from '@/types/menuTypes';
import type { AsyncSelectOption } from '@/components/ui';

interface MenuFormProps {
  defaultValues: ICreateMenu;
  onSubmit: (values: ICreateMenu) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  parentOptions: AsyncSelectOption[];
}

const createStaticLoadOptions = (options: AsyncSelectOption[]) => async (): Promise<AsyncSelectResponse> => ({
  options,
  hasMore: false,
});

export const MenuForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Changes',
  isSubmitting = false,
  parentOptions,
}: MenuFormProps) => {
  const handleSubmitErrors: SubmitErrorHandler<ICreateMenu> = errors => {
    console.log('MenuForm submit errors:', errors);
  };

  const loadParentOptions = createStaticLoadOptions(parentOptions);

  return (
    <Form
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(menuSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <section className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Menu Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
            <FormFieldCheckbox
              name="isAdmin"
              label="Is Admin Menu"
              disabled={isSubmitting}
            />
          </div>
          <FormFieldInput
            name="name"
            label="Menu Name"
            disabled={isSubmitting}
            valueTransform="none"
          />
          <FormFieldInput
            name="path"
            label="Route Path"
            disabled={isSubmitting}
            placeholder="/admin/menu-management"
            valueTransform="none"

          />
          <FormFieldInput
            name="icon"
            label="Icon"
            disabled={isSubmitting}
            placeholder="Optional icon key"
          />
          <FormFieldInput
            name="sortOrder"
            label="Sort Order"
            type="number"
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Hierarchy
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldSelect
            name="parentId"
            label="Parent Menu"
            placeholder="Select parent menu"
            loadOptions={loadParentOptions}
            defaultOptions={parentOptions}
            disabled={isSubmitting}
            isSearchable={false}
          />
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
            <FormFieldCheckbox
              name="isActive"
              label="Is Active"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
