import { useCallback, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
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
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';
import { documentProfileSchema } from '../schema';
import type { IDocumentProfileFormValues } from '../types';
import { DOCUMENT_PROFILE_TEXTS } from '../constants/documentProfileConstants';
import { DocumentProfileRuleRows } from '../components/DocumentProfileRuleRows';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useDocumentSpecificationTypeOptions } from '../hooks';

interface DocumentProfileFormProps {
  defaultValues: IDocumentProfileFormValues;
  onSubmit: (values: IDocumentProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const DocumentProfileTypeFields = ({
  isSubmitting,
}: {
  isSubmitting: boolean;
}) => {
  const { control, setValue } = useFormContext<IDocumentProfileFormValues>();
  const specificationType = useWatch({ control, name: 'specificationType' });
  const { data: specificationTypeOptions = [] } = useDocumentSpecificationTypeOptions();
  const previousSpecificationTypeRef = useRef<string | null>(null);

  const selectedSpecificationType = specificationTypeOptions.find(
    option => option.id === specificationType
  );

  const loadSpecificationTypeOptions = useCallback(
    async (): Promise<AsyncSelectResponse> => {
      return {
        options: specificationTypeOptions.map(option => ({
          value: option.id,
          label: option.label,
        })),
      };
    },
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

  return (
    <>
      <FormFieldSelect
        name="specificationType"
        label="Specification Type"
        placeholder="Select specification type"
        loadOptions={loadSpecificationTypeOptions}
        disabled={isSubmitting}
        isSearchable={false}
      />
      <FormFieldCategoryOption
        name="type"
        label="Type"
        placeholder="Select type"
        code={
          (selectedSpecificationType?.code as CategoryOptionCode) ||
          CategoryOptionCodeEnum.MasterDocument
        }
        disabled={isSubmitting || !selectedSpecificationType?.code}
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
        isCreatable={true}
      />
    </>
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
        <div className="grid gap-4 md:grid-cols-2">
          <DocumentProfileTypeFields isSubmitting={isSubmitting} />
          <FormFieldInput
            name="sortOrder"
            label="Sort Order"
            type="number"
            disabled={isSubmitting}
          />
          <div className="flex items-end gap-6">
            <FormFieldCheckbox
              name="active"
              label="Active"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardSection>

      <CardSection heading="Document Rule Setup">
        <DocumentProfileRuleRows isSubmitting={isSubmitting} />
      </CardSection>
    </Form>
  );
};
