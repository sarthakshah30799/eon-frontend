import { useCallback, useEffect, useRef } from 'react';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldInput,
  FormFieldSelect,
  FormFieldCheckbox,
} from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import { documentProfileSchema } from '../schema';
import type { IDocumentProfileFormValues } from '../types';
import { DOCUMENT_PROFILE_TEXTS } from '../constants/documentProfileConstants';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useDocumentSpecificationTypeOptions } from '../hooks';
import {
  getDocumentTypeOptionItems,
  loadDocumentTypeOptions,
} from '../utils';

interface DocumentProfileFormProps {
  defaultValues: IDocumentProfileFormValues;
  onSubmit: (values: IDocumentProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const DocumentProfileFields = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const { control, setValue } = useFormContext<IDocumentProfileFormValues>();
  const specificationType = useWatch({ control, name: 'specificationType' });
  const { data: specificationTypeOptions = [] } = useDocumentSpecificationTypeOptions();
  const previousSpecificationTypeRef = useRef<string | null>(null);

  const selectedSpecificationType = specificationTypeOptions.find(
    option => option.value === specificationType
  );

  const loadSpecificationTypeOptions = useCallback(
    async (): Promise<AsyncSelectResponse> => ({
      options: specificationTypeOptions.map(option => ({
        value: option.value,
        label: option.label,
      })),
    }),
    [specificationTypeOptions]
  );

  useEffect(() => {
    const currentSpecificationType = specificationType?.trim() || null;

    if (previousSpecificationTypeRef.current === null) {
      previousSpecificationTypeRef.current = currentSpecificationType;
      return;
    }

    if (previousSpecificationTypeRef.current !== currentSpecificationType) {
      setValue('type', '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }

    previousSpecificationTypeRef.current = currentSpecificationType;
  }, [setValue, specificationType]);

  const selectedSpecificationTypeCode =
    selectedSpecificationType?.value === 'TRANSACTION'
      ? CategoryOptionCodeEnum.Transaction
      : CategoryOptionCodeEnum.Master;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <FormFieldInput
        name="documentCode"
        label="Document Code"
        placeholder="PAN_CARD_FRONT"
        disabled={isSubmitting}
      />
      <FormFieldInput
        name="documentDescription"
        label="Document Description"
        placeholder="PAN card copy front side"
        disabled={isSubmitting}
      />
      <FormFieldSelect
        name="documentType"
        label="Document Type"
        placeholder="Select document type"
        loadOptions={loadDocumentTypeOptions}
        defaultOptions={getDocumentTypeOptionItems()}
        disabled={isSubmitting}
        isSearchable={false}
        isMulti
      />
      <FormFieldSelect
        name="specificationType"
        label="Specification Type"
        placeholder="Select specification type"
        disabled={isSubmitting}
        isSearchable={false}
        defaultOptions={specificationTypeOptions}
        loadOptions={loadSpecificationTypeOptions}
      />
      <FormFieldCategoryOption
        name="type"
        label="Type"
        placeholder="Select type"
        code={selectedSpecificationTypeCode}
        disabled={isSubmitting || !selectedSpecificationType}
        isCreatable={false}
        isSearchable={false}
      />
      <FormFieldCategoryOption
        name="groupSelection"
        label="Group"
        placeholder="Select group"
        code={CategoryOptionCodeEnum.Group}
        disabled={isSubmitting}
        isCreatable={false}
      />
      <FormFieldCategoryOption
        name="entitySelection"
        label="Entity Type"
        code={CategoryOptionCodeEnum.EntityType}
        placeholder="Select entity type"
        disabled={isSubmitting}
        isCreatable={false}
      />
      <FormFieldInput
        name="maxSizeMb"
        label="Max Size (MB)"
        type="number"
        placeholder="5"
        disabled={isSubmitting}
      />
      <FormFieldInput
        name="sortOrder"
        label="Sort Order"
        type="number"
        disabled={isSubmitting}
      />
      <div className="flex items-end gap-6">
        <FormFieldCheckbox name="isRequired" label="Required" disabled={isSubmitting} />
        <FormFieldCheckbox name="active" label="Active" disabled={isSubmitting} />
      </div>
    </div>
  );
};

export const DocumentProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = DOCUMENT_PROFILE_TEXTS.SAVE_CHANGES,
  isSubmitting = false,
}: DocumentProfileFormProps) => {
  const navigate = useNavigate();
  const handleSubmitErrors: SubmitErrorHandler<IDocumentProfileFormValues> = errors => {
    console.log('DocumentProfileForm submit errors:', errors);
  };

  return (
    <Form
      id="document-profile-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(documentProfileSchema) as Resolver<IDocumentProfileFormValues>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          navigate('/admin/document-profile');
        },
        onCancel: () => navigate('/admin/document-profile'),
      }}
    >
      <CardSection heading="Document Details">
        <DocumentProfileFields isSubmitting={isSubmitting} />
      </CardSection>
    </Form>
  );
};

export default DocumentProfileForm;
