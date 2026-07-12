import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type FieldArrayPath,
  type Path,
  type UseFormSetError,
} from 'react-hook-form';
import { Button } from '@/components/ui';
import {
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import { useMasterPages } from '@/lib';
import {
  createDraftNode,
  flattenDraftPagesForOptions,
  flattenPagesForOptions,
} from '../utils';
import type {
  IMasterPageDraftNode,
  IMasterPageOption,
  IMasterPagesFormValues,
} from '../types';

interface MasterPagesFormProps {
  onConfirm?: () => void;
}

const createRootValues = (): IMasterPagesFormValues => ({
  pages: [createDraftNode(null)],
});

const validatePageNodes = (
  nodes: IMasterPageDraftNode[],
  prefix = 'pages',
  setError?: UseFormSetError<IMasterPagesFormValues>
) => {
  let isValid = true;

  nodes.forEach((node, index) => {
    const currentPath = `${prefix}.${index}`;
    const pageNamePath =
      `${currentPath}.pageName` as Path<IMasterPagesFormValues>;
    const slugPath = `${currentPath}.slug` as Path<IMasterPagesFormValues>;

    if (!node.pageName.trim()) {
      setError?.(pageNamePath, {
        type: 'manual',
        message: 'Page name is required',
      });
      isValid = false;
    }

    if (!node.slug.trim()) {
      setError?.(slugPath, {
        type: 'manual',
        message: 'Slug is required',
      });
      isValid = false;
    }

    if (node.makeChildren && node.children.length > 0) {
      const childValid = validatePageNodes(
        node.children,
        `${currentPath}.children`,
        setError
      );
      isValid = isValid && childValid;
    }
  });

  return isValid;
};

interface NodeFieldsProps {
  name: Path<IMasterPagesFormValues>;
  depth: number;
  onRemove?: () => void;
}

const NodeFields = ({ name, depth, onRemove }: NodeFieldsProps) => {
  const form = useFormContext<IMasterPagesFormValues>();
  const childName = `${name}.children` as FieldArrayPath<IMasterPagesFormValues>;
  const { fields, append, replace, remove } = useFieldArray({
    control: form.control,
    name: childName,
  });

  const draftPages = useWatch({
    control: form.control,
    name: 'pages',
  }) as IMasterPageDraftNode[];

  const node = useWatch({
    control: form.control,
    name,
  }) as IMasterPageDraftNode | undefined;

  const currentNodeId = node?.clientId;
  const makeChildren = node?.makeChildren ?? false;
  const previousMakeChildren = useRef(false);
  const previousChildrenCount = useRef(fields.length);

  const { pages } = useMasterPages();

  const parentOptions = useMemo<IMasterPageOption[]>(() => {
    const committed = flattenPagesForOptions(pages);
    const drafted = flattenDraftPagesForOptions(draftPages ?? []);

    const merged = [...committed, ...drafted];
    const unique = new Map<string, IMasterPageOption>();

    merged.forEach(option => {
      unique.set(option.value, option);
    });

    return Array.from(unique.values()).filter(
      option => option.value !== currentNodeId
    );
  }, [currentNodeId, draftPages, pages]);

  useEffect(() => {
    if (
      makeChildren &&
      !previousMakeChildren.current &&
      fields.length === 0 &&
      currentNodeId
    ) {
      append(createDraftNode(currentNodeId));
    }

    if (!makeChildren && fields.length > 0) {
      replace([]);
    }

    previousMakeChildren.current = makeChildren;
  }, [append, currentNodeId, fields.length, makeChildren, replace]);

  useEffect(() => {
    const makeChildrenPath =
      `${name}.makeChildren` as Path<IMasterPagesFormValues>;

    if (
      previousChildrenCount.current > 0 &&
      fields.length === 0 &&
      makeChildren
    ) {
      form.setValue(makeChildrenPath, false, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    previousChildrenCount.current = fields.length;
  }, [fields.length, form, makeChildren, name]);

  const loadParentOptions = useCallback(
    async (inputValue: string) => {
      const filtered = parentOptions.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );

      return {
        options: filtered,
      };
    },
    [parentOptions]
  );

  return (
    <div
      className={[
        'relative',
        'rounded-sm border border-border-primary bg-surface-secondary p-4 shadow-sm',
        depth > 0
          ? 'ml-4 border-l-4 border-l-primary-500 bg-surface-primary'
          : '',
      ].join(' ')}
    >
      {onRemove && (
        <Button
          type="button"
          aria-label="Remove child page"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 rounded-full border border-border-primary bg-surface-primary text-text-tertiary transition hover:border-error-500 hover:bg-error-50 hover:text-error-600"
          onClick={onRemove}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name={`${name}.pageName`}
          label="Page Name"
          placeholder="Enter page name"
        />
        <FormFieldInput
          name={`${name}.slug`}
          label="Slug"
          placeholder="/utils"
        />
        <FormFieldSelect
          name={`${name}.parentId`}
          label="Parent Name"
          placeholder="Select parent page"
          loadOptions={loadParentOptions}
          pagination={false}
          disabled={depth > 0}
        />
        <div className="flex items-end">
          <FormFieldCheckbox
            name={`${name}.makeChildren`}
            label="make Children"
          />
        </div>
      </div>

      {fields.length > 0 && (
        <div className="mt-5 space-y-4 border-t border-border-primary pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">
              Children
            </p>
            <p className="text-xs text-text-tertiary">Nested pages</p>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <NodeFields
                key={field.id}
                name={
                  `${name}.children.${index}` as Path<IMasterPagesFormValues>
                }
                depth={depth + 1}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MasterPagesForm = ({ onConfirm }: MasterPagesFormProps) => {
  const { createPages } = useMasterPages();
  const form = useForm<IMasterPagesFormValues>({
    defaultValues: createRootValues(),
  });
  const { fields } = useFieldArray({
    control: form.control,
    name: 'pages',
  });

  const handleConfirm = (values: IMasterPagesFormValues) => {
    const isValid = validatePageNodes(values.pages, 'pages', form.setError);

    if (!isValid) {
      return;
    }

    createPages(values.pages);
    form.reset(createRootValues());
    onConfirm?.();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleConfirm)} className="space-y-6">
        {fields.map((field, index) => (
          <NodeFields key={field.id} name={`pages.${index}`} depth={0} />
        ))}

        <div className="flex justify-end border-t border-border-primary pt-4">
          <Button type="submit">Confirm</Button>
        </div>
      </form>
    </FormProvider>
  );
};
