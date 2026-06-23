import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldInput,
  FormFieldSelect,
  FormFieldCheckbox,
  FormFieldCategoryOption,
} from '@/components/forms';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';
import { documentProfileSchema } from '../schema';
import type { IDocumentProfileFormValues } from '../types';
import { DOCUMENT_PROFILE_TEXTS, loadDocumentSpecificationTypeOptions } from '../constants/documentProfileConstants';
import { DocumentProfileRuleRows } from '../components/DocumentProfileRuleRows';

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
  const previousSpecificationTypeRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSpecificationType = specificationType?.trim() || null;

    if (previousSpecificationTypeRef.current === null) {
      previousSpecificationTypeRef.current = currentSpecificationType;
      return;
    }

    if (previousSpecificationTypeRef.current !== currentSpecificationType) {
      setValue('transactionType', '', {
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
        loadOptions={loadDocumentSpecificationTypeOptions}
        disabled={isSubmitting}
        isSearchable={false}
      />
      <FormFieldCategoryOption
        name="transactionType"
        label="Type"
        placeholder="Select transaction type"
        code={specificationType as CategoryOptionCode}
        disabled={isSubmitting || !specificationType}
        isCreatable={false}
        isSearchable={false}
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
