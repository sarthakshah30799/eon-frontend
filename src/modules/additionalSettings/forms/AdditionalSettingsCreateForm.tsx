import { useCallback, useEffect, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import { Button } from '@/components/ui/button1';
import { CardSection, Checkbox } from '@/components/ui';
import { Form, FormFieldInput, FormFieldSelect, FormFieldDatePicker, FormFieldTextarea } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile';
import { additionalSettingsSchema } from '../schema';
import {
  createEmptyAdditionalSettingCategoryFormValues,
  createEmptyAdditionalSettingSubcategoryFormValues,
} from '../utils';
import type { IAdditionalSettingCategoryFormValues } from '../types';
import {
  ADDITIONAL_SETTINGS_TEXTS,
  AdditionalSettingsCodeEnum,
} from '../constants';
import { useListValueTypes } from '../hooks';
import {
  getAdditionalSettingCategoryCodeOptions,
  getAdditionalSettingSubcategoryCodeOptions,
  getAdditionalSettingSubcategoryDefinition,
} from '../registry/additionalSettingsRegistry';

interface AdditionalSettingsCreateFormProps {
  defaultValues?: IAdditionalSettingCategoryFormValues;
  existingCategoryCodes?: string[];
  onSubmit: (values: IAdditionalSettingCategoryFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  currentId?: string;
}

const noTransformInputProps = {
  valueTransform: 'none' as const,
};

const SubcategoryRowFields = ({
  index,
  categoryCode,
  isSubmitting,
  loadTypeOptions,
  remove,
  fieldsLength,
  isFixed = false,
  usedCodes,
}: {
  index: number;
  categoryCode?: string;
  isSubmitting: boolean;
  loadTypeOptions: () => Promise<{ options: { value: string; label: string }[]; hasMore: boolean }>;
  remove: (index: number) => void;
  fieldsLength: number;
  isFixed?: boolean;
  usedCodes: string[];
}) => {
  const { control, setValue } = useFormContext<IAdditionalSettingCategoryFormValues>();

  const subcategoryCode = useWatch({
    control,
    name: `subcategories.${index}.code`,
  });
  const categoryType = useWatch({
    control,
    name: `subcategories.${index}.categoryType`,
  });
  const subcategoryValue = useWatch({
    control,
    name: `subcategories.${index}.value`,
  });

  const subcategoryDefinition = getAdditionalSettingSubcategoryDefinition(
    categoryCode,
    subcategoryCode
  );
  const isBooleanType = categoryType?.toLowerCase() === 'boolean';
  const isDateType = categoryType?.toLowerCase() === 'date';
  const isSelectType = categoryType?.toLowerCase() === 'select';
  const isJsonType = categoryType?.toLowerCase() === 'json';
  const isNumberType =
    subcategoryDefinition?.valueType === 'number' ||
    subcategoryDefinition?.valueType === 'decimal' ||
    categoryType?.toLowerCase() === 'number' ||
    categoryType?.toLowerCase() === 'decimal';

  const prevTypeRef = useRef(categoryType);
  useEffect(() => {
    if (categoryType !== prevTypeRef.current) {
      prevTypeRef.current = categoryType;
      if (categoryType?.toLowerCase() === 'boolean') {
        setValue(`subcategories.${index}.value`, 'NO');
      } else {
        setValue(`subcategories.${index}.value`, '');
      }
    }
  }, [categoryType, index, setValue]);

  useEffect(() => {
    if (subcategoryDefinition) {
      setValue(
        `subcategories.${index}.categoryType`,
        subcategoryDefinition.valueType,
      );
    }
  }, [index, subcategoryDefinition, setValue]);

  const loadAccountProfileOptions = useCallback(async (inputValue: string, page = 1) => {
    const response = await accountProfileApi.getAccountProfiles({
      page,
      limit: 30,
      search: inputValue,
      active: true,
    });

    return {
      options: (response.data || []).map(account => ({
        value: account.id,
        label: `${account.accountCode} - ${account.accountName}`,
      })),
      hasMore: (response.data || []).length === 30,
    };
  }, []);

  const loadSelectValueOptions = async (inputValue: string, page = 1) => {
    if (subcategoryDefinition?.optionsSource === 'account-profile') {
      return loadAccountProfileOptions(inputValue, page);
    }

    return {
      options: (subcategoryDefinition?.options ?? []).map(option => ({
        value: option.value,
        label: option.label,
      })),
      hasMore: false,
    };
  };

  const loadCodeOptions = async () => {
    const currentCode = String(subcategoryCode ?? '').trim().toUpperCase();
    const blockedCodes = new Set(
      usedCodes.filter(code => code && code !== currentCode)
    );

    return {
      options: getAdditionalSettingSubcategoryCodeOptions(categoryCode)
        .filter(option => !blockedCodes.has(String(option.value).trim().toUpperCase()))
        .map(option => ({
          value: option.value,
          label: option.label,
        })),
      hasMore: false,
    };
  };

  return (
      <div className="relative rounded-sm border border-border-primary bg-surface-primary p-4">
      {fieldsLength > 0 && !isFixed && (
        <Button
          type="button"
          aria-label={`Remove subcategory ${index + 1}`}
          variant="ghost"
          size="icon"
          className="absolute right-3 top-0 rounded-full border border-border-primary bg-surface-primary text-text-tertiary transition hover:border-error-500 hover:bg-error-50 hover:text-error-600 disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => remove(index)}
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
          name={`subcategories.${index}.title`}
          label="Title"
          placeholder="Enter subcategory title"
          disabled={isSubmitting}
        />
        <FormFieldSelect
          name={`subcategories.${index}.code`}
          label="Code"
          placeholder="Select subcategory code"
          disabled={isSubmitting || !categoryCode}
          loadOptions={loadCodeOptions}
          isSearchable={false}
        />
        <FormFieldSelect
          name={`subcategories.${index}.categoryType`}
          label="Category Type"
          placeholder="Select type"
          disabled={isSubmitting || Boolean(subcategoryDefinition)}
          loadOptions={loadTypeOptions}
          isSearchable={false}
        />

        {isBooleanType ? (
          <div className="flex items-center gap-3 rounded-sm border border-border-primary bg-surface-primary px-3 py-2">
            <Checkbox
              checked={String(subcategoryValue ?? '').trim().toUpperCase() === 'YES'}
              onChange={checked =>
                setValue(`subcategories.${index}.value`, checked ? 'YES' : 'NO')
              }
              disabled={isSubmitting}
              aria-label={`Toggle ${subcategoryDefinition?.label ?? 'value'}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">
                {subcategoryDefinition?.label ?? 'Enabled'}
              </p>
              <p className="text-xs text-text-tertiary">
                Check this box to enable the setting.
              </p>
            </div>
          </div>
        ) : isDateType ? (
          <FormFieldDatePicker
            name={`subcategories.${index}.value`}
            label="Value"
            placeholder="Select date"
            disabled={isSubmitting}
          />
        ) : isSelectType ? (
        <FormFieldSelect
          name={`subcategories.${index}.value`}
          label="Value"
          placeholder="Select value"
          disabled={isSubmitting}
          loadOptions={loadSelectValueOptions}
          isSearchable={subcategoryDefinition?.optionsSource === 'account-profile'}
        />
        ) : isJsonType ? (
          <FormFieldTextarea
            name={`subcategories.${index}.value`}
            label="Value (JSON)"
            placeholder="Enter JSON value"
            disabled={isSubmitting}
            rows={3}
          />
        ) : isNumberType ? (
          <div className="space-y-1">
            <FormFieldInput
              name={`subcategories.${index}.value`}
              label="Value"
              placeholder={subcategoryDefinition?.placeholder ?? 'Enter number value'}
              type="number"
              disabled={isSubmitting}
              required={subcategoryDefinition?.required ?? true}
              {...noTransformInputProps}
            />
            {categoryCode?.trim().toUpperCase() === 'TRANSACTION_NUMBERING' ? (
              <p className="text-[11px] leading-tight text-text-tertiary">
                Enter the starting series counter. The backend fits the series width so the final number stays within 15 characters: branch code + financial year + series.
              </p>
            ) : null}
          </div>
        ) : (
          <FormFieldInput
            name={`subcategories.${index}.value`}
            label="Value"
            placeholder={subcategoryDefinition?.placeholder ?? 'Enter value'}
            disabled={isSubmitting}
            required={subcategoryDefinition?.required ?? true}
            {...noTransformInputProps}
          />
        )}
      </div>
    </div>
  );
};

const SubcategoryFields = ({
  isSubmitting,
}: {
  isSubmitting: boolean;
}) => {
  const { control, setValue } = useFormContext<IAdditionalSettingCategoryFormValues>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'subcategories',
  });
  const { data: valueTypes = [] } = useListValueTypes();
  const categoryCode = useWatch({
    control,
    name: 'code',
  });
  const subcategories = useWatch({
    control,
    name: 'subcategories',
  }) as IAdditionalSettingCategoryFormValues['subcategories'];
  const selectedSubcategoryCodes = Array.from(
    new Set(
      (subcategories ?? [])
        .map(subcategory => String(subcategory?.code ?? '').trim().toUpperCase())
        .filter(Boolean)
    )
  );
  const isTransactionApprovalCategory =
    categoryCode?.trim().toUpperCase() ===
    AdditionalSettingsCodeEnum.TransactionApprovalPolicy;
  const isTransactionSacCategory =
    categoryCode?.trim().toUpperCase() ===
    AdditionalSettingsCodeEnum.TransactionSacCode;
  const isFixedCategory = isTransactionApprovalCategory || isTransactionSacCategory;

  useEffect(() => {
    if (!isFixedCategory) {
      return;
    }

    const predefinedRows = getAdditionalSettingSubcategoryCodeOptions(categoryCode).map(option => {
      const subcategoryDefinition = getAdditionalSettingSubcategoryDefinition(
        categoryCode,
        option.value
      );

      return {
        title: option.label,
        code: option.value,
        value: subcategoryDefinition?.valueType === 'boolean' ? 'NO' : '',
        categoryType: subcategoryDefinition?.valueType ?? 'text',
      };
    });

    const currentCodes = (subcategories ?? [])
      .map(subcategory => String(subcategory?.code ?? '').trim().toUpperCase())
      .filter(Boolean);
    const requiredCodes = predefinedRows.map(row => row.code.trim().toUpperCase());
    const hasAllPredefinedRows =
      currentCodes.length === requiredCodes.length &&
      requiredCodes.every(code => currentCodes.includes(code));

    if (!hasAllPredefinedRows) {
      replace(predefinedRows);
    }
  }, [categoryCode, isFixedCategory, replace, subcategories]);

  useEffect(() => {
    const allowedCodes = new Set(
      getAdditionalSettingSubcategoryCodeOptions(categoryCode).map(option => option.value)
    );

    subcategories?.forEach((subcategory, index) => {
      const code = String(subcategory?.code ?? '').trim().toUpperCase();

      if (code && !allowedCodes.has(code as never)) {
        setValue(`subcategories.${index}.code`, '');
        setValue(`subcategories.${index}.categoryType`, '');
        setValue(`subcategories.${index}.value`, '');
      }
    });
  }, [categoryCode, setValue, subcategories]);

  const loadTypeOptions = async () => {
    const options = valueTypes.map(t => ({ value: t, label: t.toUpperCase() }));
    return {
      options,
      hasMore: false,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {ADDITIONAL_SETTINGS_TEXTS.SUBCATEGORIES}
          </p>
          <p className="text-xs text-text-tertiary">
            Add linked subcategory definitions for this category.
          </p>
        </div>

        {!isFixedCategory ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => append(createEmptyAdditionalSettingSubcategoryFormValues())}
          >
            {fields.length === 0
              ? ADDITIONAL_SETTINGS_TEXTS.ADD_SUBCATEGORY
              : ADDITIONAL_SETTINGS_TEXTS.ADD_MORE}
          </Button>
        ) : null}
      </div>

      {fields.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border-primary bg-surface-primary p-4 text-sm text-text-tertiary">
          No subcategories yet. Use the button above to add the first one.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <SubcategoryRowFields
              key={field.id}
              index={index}
              categoryCode={categoryCode}
              isSubmitting={isSubmitting}
              loadTypeOptions={loadTypeOptions}
              remove={remove}
              fieldsLength={fields.length}
              isFixed={isFixedCategory}
              usedCodes={selectedSubcategoryCodes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AdditionalSettingsCreateForm = ({
  defaultValues,
  existingCategoryCodes = [],
  onSubmit,
  isSubmitting = false,
  submitLabel = ADDITIONAL_SETTINGS_TEXTS.CREATE_CATEGORY,
  currentId,
}: AdditionalSettingsCreateFormProps) => {
  const initialValues =
    defaultValues ?? createEmptyAdditionalSettingCategoryFormValues();
  const normalizedExistingCategoryCodes = new Set(
    existingCategoryCodes.map(code => String(code ?? '').trim().toUpperCase()).filter(Boolean)
  );
  const loadCategoryCodeOptions = async () => ({
    options: getAdditionalSettingCategoryCodeOptions()
      .filter(option => {
        const code = String(option.value).trim().toUpperCase();
        if (!code) {
          return false;
        }

        if (currentId) {
          return code === String(defaultValues?.code ?? '').trim().toUpperCase();
        }

        return !normalizedExistingCategoryCodes.has(code);
      })
      .map(option => ({
        value: option.value,
        label: option.label,
      })),
    hasMore: false,
  });

  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(additionalSettingsSchema) as Resolver<IAdditionalSettingCategoryFormValues>}
      defaultValues={initialValues}
      className="space-y-6"
    >
      <CardSection heading={ADDITIONAL_SETTINGS_TEXTS.CATEGORY_TITLE}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <FormFieldInput
              name="title"
              label={ADDITIONAL_SETTINGS_TEXTS.CATEGORY_TITLE}
              placeholder="Enter category title"
              disabled={isSubmitting}
            />
          </div>
          <FormFieldSelect
            name="code"
            label={ADDITIONAL_SETTINGS_TEXTS.CATEGORY_CODE}
            placeholder="Select category code"
            disabled={isSubmitting || Boolean(currentId)}
            loadOptions={loadCategoryCodeOptions}
            isSearchable={false}
          />
        </div>
      </CardSection>

      <CardSection heading={ADDITIONAL_SETTINGS_TEXTS.SUBCATEGORIES}>
        <SubcategoryFields isSubmitting={isSubmitting} />
      </CardSection>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};

export default AdditionalSettingsCreateForm;
